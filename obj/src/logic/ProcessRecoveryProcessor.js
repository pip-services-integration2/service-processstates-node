"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessRecoveryProcessor = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const RecoveryController_1 = require("./RecoveryController");
const ProcessStatusV1_1 = require("../data/version1/ProcessStatusV1");
class ProcessRecoveryProcessor {
    constructor() {
        this._logger = new pip_services3_components_nodex_1.CompositeLogger();
        this._timer = new pip_services3_commons_nodex_1.FixedRateTimer();
        this._correlationId = "integration.processesstates";
        this._interval = 1 * 60 * 1000; // 1 minute
        this._batchSize = 100;
    }
    configure(config) {
        this._logger.configure(config);
        this._interval = config.getAsIntegerWithDefault("options.interval", this._interval);
    }
    setReferences(references) {
        this._logger.setReferences(references);
        this._recoveryController = new RecoveryController_1.RecoveryController(references);
        this._controller = references.getOneRequired(new pip_services3_commons_nodex_1.Descriptor("service-processstates", "controller", "default", "*", "1.0"));
        this._persistence = references.getOneRequired(new pip_services3_commons_nodex_1.Descriptor("service-processstates", "persistence", "*", "*", "1.0"));
    }
    open(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._timer.setDelay(this._interval);
            this._timer.setInterval(this._interval);
            this._timer.setTask({
                notify: (correlationId, args) => {
                    this._recoveryProcessing(correlationId);
                }
            });
            this._logger.info(correlationId, "Recovery processing is enable");
            this._timer.start();
        });
    }
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._timer.stop();
            this._logger.info(correlationId, "Recovery processing is disable");
        });
    }
    isOpen() {
        return this._timer != null && this._timer.isStarted();
    }
    _recoveryProcessing(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._logger.info(correlationId, "Starting recovery of process states");
            var recovered = 0;
            var skip = 0;
            var now = new Date();
            var recover = true;
            try {
                while (recover) {
                    let filter = pip_services3_commons_nodex_1.FilterParams.fromTuples("states", ProcessStatusV1_1.ProcessStatusV1.Starting + "," + ProcessStatusV1_1.ProcessStatusV1.Running, "recovered", true);
                    let paging = new pip_services3_commons_nodex_1.PagingParams(skip, this._batchSize, false);
                    let page = yield this._persistence.getPageByFilter(correlationId, filter, paging);
                    let counter = 0;
                    try {
                        while (counter != page.data.length) {
                            let process = page.data[counter];
                            counter++;
                            if (this._recoveryController.isAttemptsExceeded(process)) {
                                this._logger.warn(process.id, "Process " + process + " has reached maximum number of attempts and will be failed");
                                this._controller.failProcess(correlationId, process, "Exceeded number of failed attempts");
                                recovered++;
                            }
                            else if (this._recoveryController.isRecoveryDue(process)) {
                                this._logger.info(process.id, "Recovery started for process " + process);
                                let res = yield this._recoveryController.sendRecovery(process);
                                // Clear compensation
                                yield this._controller.clearProcessRecovery(correlationId, process);
                                recovered++;
                            }
                        }
                    }
                    catch (err) {
                        if (page.data.length < this._batchSize)
                            recover = false;
                        else
                            skip += page.data.length;
                        this._logger.error(correlationId, err, "Failed to fail recovery process " + process);
                        throw err;
                    }
                }
            }
            catch (err) {
                if (recovered > 0)
                    this._logger.info(correlationId, "Recovered " + recovered + " processes");
                else
                    this._logger.info(correlationId, "Found no processes that require recovery");
                this._logger.debug(correlationId, "Finished processes recovery");
                throw err;
            }
        });
    }
}
exports.ProcessRecoveryProcessor = ProcessRecoveryProcessor;
//# sourceMappingURL=ProcessRecoveryProcessor.js.map