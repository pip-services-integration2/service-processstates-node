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
exports.ProcessCloseExpiredProcessor = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const version1_1 = require("../data/version1");
class ProcessCloseExpiredProcessor {
    constructor() {
        this._logger = new pip_services3_components_nodex_1.CompositeLogger();
        this._timer = new pip_services3_commons_nodex_1.FixedRateTimer();
        this._correlationId = "integration.processesstates";
        this._interval = 5 * 60 * 1000; // 5 minutes
        this._batchSize = 100;
    }
    configure(config) {
        this._logger.configure(config);
        this._interval = config.getAsIntegerWithDefault("options.interval", this._interval);
    }
    setReferences(references) {
        this._logger.setReferences(references);
        this._controller = references.getOneRequired(new pip_services3_commons_nodex_1.Descriptor("service-processstates", "controller", "default", "*", "1.0"));
        this._persistence = references.getOneRequired(new pip_services3_commons_nodex_1.Descriptor("service-processstates", "persistence", "*", "*", "1.0"));
    }
    open(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._timer.setDelay(this._interval);
            this._timer.setInterval(this._interval);
            this._timer.setTask({
                notify: (correlationId, args) => {
                    this._closeExpiredProcessing(correlationId);
                }
            });
            this._logger.info(correlationId, "Closing expired processing is enable");
            this._timer.start();
        });
    }
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._timer.stop();
            this._logger.info(correlationId, "Closing expired processing is disable");
        });
    }
    isOpen() {
        return this._timer != null && this._timer.isStarted();
    }
    _closeExpiredProcessing(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._logger.info(correlationId, "Starting close expired of process states");
            let expirations = 0;
            let skip = 0;
            let now = new Date();
            let recover = true;
            try {
                while (recover) {
                    let filter = pip_services3_commons_nodex_1.FilterParams.fromTuples("states", version1_1.ProcessStatusV1.Starting + "," + version1_1.ProcessStatusV1.Running, "recovered", true);
                    let paging = new pip_services3_commons_nodex_1.PagingParams(skip, this._batchSize, false);
                    let page = yield this._persistence.getPageByFilter(correlationId, filter, paging);
                    let counter = 0;
                    try {
                        while (counter != page.data.length) {
                            let process = page.data[counter];
                            counter++;
                            // Double check for expired processes
                            if (process.expiration_time < now) {
                                // Fail expired processes
                                try {
                                    yield this._controller.failProcess(correlationId, process, "Reached expiration time");
                                    expirations++;
                                    this._logger.warn(process.id, "Close expired process " + process);
                                }
                                catch (ex) {
                                    this._logger.error(process.id, ex, "Failed to expire process " + process);
                                    throw ex;
                                }
                            }
                        }
                    }
                    catch (err) {
                        if (page.data.length < this._batchSize)
                            recover = false;
                        else
                            skip += page.data.length;
                        throw err;
                    }
                }
            }
            catch (err) {
                if (expirations > 0)
                    this._logger.info(correlationId, "Close " + expirations + " expired processes");
                else
                    this._logger.info(correlationId, "No expired processes were found");
                this._logger.debug(correlationId, "Completed close expired of process states");
                throw err;
            }
        });
    }
}
exports.ProcessCloseExpiredProcessor = ProcessCloseExpiredProcessor;
//# sourceMappingURL=ProcessCloseExpiredProcessor.js.map