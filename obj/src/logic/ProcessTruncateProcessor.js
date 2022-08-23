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
exports.ProcessTruncateProcessor = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
class ProcessTruncateProcessor {
    constructor() {
        this._logger = new pip_services3_components_nodex_1.CompositeLogger();
        this._timer = new pip_services3_commons_nodex_1.FixedRateTimer();
        this._correlationId = "integration.processesstates";
        this._interval = 90 * 24 * 60 * 60 * 1000; // 90 days;
    }
    configure(config) {
        this._logger.configure(config);
        this._interval = config.getAsIntegerWithDefault("options.interval", this._interval);
    }
    setReferences(references) {
        this._logger.setReferences(references);
        this._controller = references.getOneRequired(new pip_services3_commons_nodex_1.Descriptor("service-processstates", "controller", "default", "*", "1.0"));
    }
    open(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._timer.setDelay(this._interval);
            this._timer.setInterval(this._interval);
            this._timer.setTask({
                notify: (correlationId, args) => {
                    this._truncateProcessing(correlationId);
                }
            });
            this._logger.info(correlationId, "Truncate processing is enable");
            this._timer.start();
        });
    }
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._timer.stop();
            this._logger.info(correlationId, "Truncate processing is disable");
        });
    }
    isOpen() {
        return this._timer != null && this._timer.isStarted();
    }
    _truncateProcessing(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._logger.info(correlationId, "Starting truncation of process states");
            try {
                yield this._controller.truncate(correlationId, 0);
                this._logger.info(correlationId, "Completed truncation of process states");
            }
            catch (err) {
                this._logger.error(correlationId, err, "Truncation of process states failed");
            }
        });
    }
}
exports.ProcessTruncateProcessor = ProcessTruncateProcessor;
//# sourceMappingURL=ProcessTruncateProcessor.js.map