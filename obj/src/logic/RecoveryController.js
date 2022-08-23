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
exports.RecoveryController = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const RecoveryManager_1 = require("./RecoveryManager");
const pip_services3_messaging_nodex_1 = require("pip-services3-messaging-nodex");
class RecoveryController {
    constructor(references, logger) {
        this._references = references;
        if (!logger) {
            logger = new pip_services3_components_nodex_1.CompositeLogger(references);
        }
        this._logger = logger;
    }
    isRecoveryDue(status) {
        return RecoveryManager_1.RecoveryManager.isRecoveryDue(status);
    }
    isAttemptsExceeded(status) {
        //TEMPORARY, to get workflows flowing
        return false;
        return RecoveryManager_1.RecoveryManager.isAttemptsExceeded(status);
    }
    sendRecovery(status) {
        return __awaiter(this, void 0, void 0, function* () {
            var message = status.recovery_message;
            if (message == null) {
                this._logger.error(status.id, null, "Process " + status + " is missing recovery message");
                return false;
            }
            var queue = status.recovery_queue_name != null
                // TODO: must change mechanism of geting queues
                ? this._references.getOneRequired(new pip_services3_commons_nodex_1.Descriptor("*", "queue", "*", status.recovery_queue_name, "1.0")) : null;
            if (queue == null) {
                this._logger.error(status.id, null, "Process " + status + " is missing recovery queue name");
                return false;
            }
            // Send a recovery message
            message.correlation_id = message.correlation_id || status.id;
            yield queue.send(message.correlation_id, this._convertToMessageEnvelope(message));
            this._logger.info(status.id, "Sent recovery message for process " + status + " to " + queue);
            return true;
        });
    }
    _convertToMessageEnvelope(msg) {
        var item = new pip_services3_messaging_nodex_1.MessageEnvelope(msg.correlation_id, msg.message_type, msg.message);
        item.sent_time = msg.sent_time;
        item.message_id = msg.message_id;
        return item;
    }
}
exports.RecoveryController = RecoveryController;
//# sourceMappingURL=RecoveryController.js.map