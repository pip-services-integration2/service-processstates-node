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
exports.ProcessStatesCommandSet = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const version1_1 = require("../data/version1");
class ProcessStatesCommandSet extends pip_services3_commons_nodex_1.CommandSet {
    constructor(controller) {
        super();
        this._controller = controller;
        this.addCommand(this.makeGetProcessesCommand());
        this.addCommand(this.makeGetProcessesByIdCommand());
        this.addCommand(this.makeStartProcessCommand());
        this.addCommand(this.makeActivateOrStartProcessCommand());
        this.addCommand(this.makeActivateProcessCommand());
        this.addCommand(this.makeActivateProcessByKeyCommand());
        this.addCommand(this.makeRollbackProcessCommand());
        this.addCommand(this.makeContinueProcessCommand());
        this.addCommand(this.makeContinueAndRecoveryProcessCommand());
        this.addCommand(this.makeRepeatProcessRecoveryCommand());
        this.addCommand(this.makeClearProcessRecoveryCommand());
        this.addCommand(this.makeFailAndContinueProcessCommand());
        this.addCommand(this.makeFailAndRecoverProcessCommand());
        this.addCommand(this.makeSuspendProcessCommand());
        this.addCommand(this.makeFailProcessCommand());
        this.addCommand(this.makeResumeProcessCommand());
        this.addCommand(this.makeCompleteProcessCommand());
        this.addCommand(this.makeAbortProcessCommand());
        this.addCommand(this.makeUpdateProcessCommand());
        this.addCommand(this.makeDeleteProcessByIdCommand());
        this.addCommand(this.makeRequestProcessForResponceCommand());
    }
    makeGetProcessesCommand() {
        return new pip_services3_commons_nodex_1.Command('get_processes', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withOptionalProperty('filter', new pip_services3_commons_nodex_1.FilterParamsSchema())
            .withOptionalProperty('paging', new pip_services3_commons_nodex_2.PagingParamsSchema()), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let filter = pip_services3_commons_nodex_2.FilterParams.fromValue(args.get('filter'));
            let paging = pip_services3_commons_nodex_2.PagingParams.fromValue(args.get('paging'));
            return yield this._controller.getProcesses(correlationId, filter, paging);
        }));
    }
    makeGetProcessesByIdCommand() {
        return new pip_services3_commons_nodex_1.Command('get_process_by_id', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('process_id', pip_services3_commons_nodex_1.TypeCode.String), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let processId = args.getAsString('process_id');
            return yield this._controller.getProcessById(correlationId, processId);
        }));
    }
    makeStartProcessCommand() {
        return new pip_services3_commons_nodex_1.Command('start_process', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withOptionalProperty('process_type', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('process_key', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('task_type', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('queue_name', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('message', new version1_1.MessageV1Schema())
            .withOptionalProperty('ttl', pip_services3_commons_nodex_1.TypeCode.Long), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let processType = args.getAsString('process_type');
            let processKey = args.getAsString('process_key');
            let taskType = args.getAsString('task_type');
            let queueName = args.getAsString('queue_name');
            let message = args.getAsObject('message');
            let ttl = args.getAsLongWithDefault('ttl', 0);
            return yield this._controller.startProcess(correlationId, processType, processKey, taskType, queueName, message, ttl);
        }));
    }
    makeActivateOrStartProcessCommand() {
        return new pip_services3_commons_nodex_1.Command('activate_or_start_process', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withOptionalProperty('process_type', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('process_key', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('task_type', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('queue_name', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('message', new version1_1.MessageV1Schema())
            .withOptionalProperty('ttl', pip_services3_commons_nodex_1.TypeCode.Long), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let processType = args.getAsString('process_type');
            let processKey = args.getAsString('process_key');
            let taskType = args.getAsString('task_type');
            let queueName = args.getAsString('queue_name');
            let message = args.getAsObject('message');
            let ttl = args.getAsLongWithDefault('ttl', 0);
            return yield this._controller.activateOrStartProcess(correlationId, processType, processKey, taskType, queueName, message, ttl);
        }));
    }
    makeActivateProcessCommand() {
        return new pip_services3_commons_nodex_1.Command('activate_process', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('process_id', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('task_type', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('queue_name', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('message', new version1_1.MessageV1Schema()), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let processId = args.getAsString('process_id');
            let taskType = args.getAsString('task_type');
            let queueName = args.getAsString('queue_name');
            let message = args.getAsObject('message');
            return yield this._controller.activateProcess(correlationId, processId, taskType, queueName, message);
        }));
    }
    makeActivateProcessByKeyCommand() {
        return new pip_services3_commons_nodex_1.Command('activate_process_by_key', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withOptionalProperty('process_type', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('process_key', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('task_type', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('queue_name', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('message', new version1_1.MessageV1Schema()), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let processType = args.getAsString('process_type');
            let processKey = args.getAsString('process_key');
            let taskType = args.getAsString('task_type');
            let queueName = args.getAsString('queue_name');
            let message = args.getAsObject('message');
            return yield this._controller.activateProcessByKey(correlationId, processType, processKey, taskType, queueName, message);
        }));
    }
    makeRollbackProcessCommand() {
        return new pip_services3_commons_nodex_1.Command('rollback_process', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('state', new version1_1.ProcessStateV1Schema()), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let state = args.getAsObject('state');
            return yield this._controller.rollbackProcess(correlationId, state);
        }));
    }
    makeContinueProcessCommand() {
        return new pip_services3_commons_nodex_1.Command('continue_process', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('state', new version1_1.ProcessStateV1Schema()), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let state = args.getAsObject('state');
            return yield this._controller.continueProcess(correlationId, state);
        }));
    }
    makeContinueAndRecoveryProcessCommand() {
        return new pip_services3_commons_nodex_1.Command('continue_and_recovery_process', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('state', new version1_1.ProcessStateV1Schema())
            .withOptionalProperty('queue_name', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('message', new version1_1.MessageV1Schema())
            .withRequiredProperty('timeout', pip_services3_commons_nodex_1.TypeCode.Long), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let state = args.getAsObject('state');
            let queueName = args.getAsString('queue_name');
            let message = args.getAsObject('message');
            let timeout = args.getAsLongWithDefault('timeout', 0);
            return yield this._controller.continueAndRecoverProcess(correlationId, state, queueName, message, timeout);
        }));
    }
    makeRepeatProcessRecoveryCommand() {
        return new pip_services3_commons_nodex_1.Command('repeat_process_recovery', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('state', new version1_1.ProcessStateV1Schema())
            .withRequiredProperty('timeout', pip_services3_commons_nodex_1.TypeCode.Long), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let state = args.getAsObject('state');
            let timeout = args.getAsLong('timeout');
            return yield this._controller.repeatProcessRecovery(correlationId, state, timeout);
        }));
    }
    makeClearProcessRecoveryCommand() {
        return new pip_services3_commons_nodex_1.Command('clear_process_recovery', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('state', new version1_1.ProcessStateV1Schema()), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let state = args.getAsObject('state');
            return yield this._controller.clearProcessRecovery(correlationId, state);
        }));
    }
    makeFailAndContinueProcessCommand() {
        return new pip_services3_commons_nodex_1.Command('fail_and_continue_process', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('state', new version1_1.ProcessStateV1Schema())
            .withRequiredProperty('err_msg', pip_services3_commons_nodex_1.TypeCode.String), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let state = args.getAsObject('state');
            let errMsg = args.getAsObject('err_msg');
            return yield this._controller.failAndContinueProcess(correlationId, state, errMsg);
        }));
    }
    makeFailAndRecoverProcessCommand() {
        return new pip_services3_commons_nodex_1.Command('fail_and_recover_process', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('state', new version1_1.ProcessStateV1Schema())
            .withRequiredProperty('err_msg', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('queue_name', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('message', new version1_1.MessageV1Schema())
            .withRequiredProperty('timeout', pip_services3_commons_nodex_1.TypeCode.Long), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let state = args.getAsObject('state');
            let errMsg = args.getAsObject('err_msg');
            let queueName = args.getAsString('queue_name');
            let message = args.getAsObject('message');
            let timeout = args.getAsLong('timeout');
            return yield this._controller.failAndRecoverProcess(correlationId, state, errMsg, queueName, message, timeout);
        }));
    }
    makeSuspendProcessCommand() {
        return new pip_services3_commons_nodex_1.Command('suspend_process', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('state', new version1_1.ProcessStateV1Schema())
            .withOptionalProperty('request', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('queue_name', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('message', new version1_1.MessageV1Schema())
            .withRequiredProperty('timeout', pip_services3_commons_nodex_1.TypeCode.Long), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let state = args.getAsObject('state');
            let request = args.getAsString('request');
            let queueName = args.getAsString('queue_name');
            let message = args.getAsObject('message');
            let timeout = args.getAsLong('timeout');
            return yield this._controller.suspendProcess(correlationId, state, request, queueName, message, timeout);
        }));
    }
    makeFailProcessCommand() {
        return new pip_services3_commons_nodex_1.Command('fail_process', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('state', new version1_1.ProcessStateV1Schema())
            .withRequiredProperty('err_msg', pip_services3_commons_nodex_1.TypeCode.String), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let state = args.getAsObject('state');
            let errMsg = args.getAsString('err_msg');
            return yield this._controller.failProcess(correlationId, state, errMsg);
        }));
    }
    makeResumeProcessCommand() {
        return new pip_services3_commons_nodex_1.Command('resume_process', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('state', new version1_1.ProcessStateV1Schema())
            .withRequiredProperty('comment', pip_services3_commons_nodex_1.TypeCode.String), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let state = args.getAsObject('state');
            let comment = args.getAsString('comment');
            return yield this._controller.resumeProcess(correlationId, state, comment);
        }));
    }
    makeCompleteProcessCommand() {
        return new pip_services3_commons_nodex_1.Command('complete_process', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('state', new version1_1.ProcessStateV1Schema()), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let state = args.getAsObject('state');
            return yield this._controller.completeProcess(correlationId, state);
        }));
    }
    makeAbortProcessCommand() {
        return new pip_services3_commons_nodex_1.Command('abort_process', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('state', new version1_1.ProcessStateV1Schema())
            .withRequiredProperty('comment', pip_services3_commons_nodex_1.TypeCode.String), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let state = args.getAsObject('state');
            let comment = args.getAsString('comment');
            return yield this._controller.abortProcess(correlationId, state, comment);
        }));
    }
    makeUpdateProcessCommand() {
        return new pip_services3_commons_nodex_1.Command('update_process', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('state', new version1_1.ProcessStateV1Schema()), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let state = args.getAsObject('state');
            return yield this._controller.updateProcess(correlationId, state);
        }));
    }
    makeDeleteProcessByIdCommand() {
        return new pip_services3_commons_nodex_1.Command('delete_process_by_id', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('process_id', pip_services3_commons_nodex_1.TypeCode.String), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let processId = args.getAsString('process_id');
            return yield this._controller.deleteProcessById(correlationId, processId);
        }));
    }
    makeRequestProcessForResponceCommand() {
        return new pip_services3_commons_nodex_1.Command('request_process_for_response', new pip_services3_commons_nodex_1.ObjectSchema(true)
            .withRequiredProperty('state', new version1_1.ProcessStateV1Schema())
            .withRequiredProperty('request', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('queue_name', pip_services3_commons_nodex_1.TypeCode.String)
            .withOptionalProperty('message', new version1_1.MessageV1Schema()), (correlationId, args) => __awaiter(this, void 0, void 0, function* () {
            let state = args.getAsObject('state');
            let request = args.getAsString('request');
            let queueName = args.getAsString('queue_name');
            let message = args.getAsObject('message');
            return yield this._controller.requestProcessForResponse(correlationId, state, request, queueName, message);
        }));
    }
}
exports.ProcessStatesCommandSet = ProcessStatesCommandSet;
//# sourceMappingURL=ProcessStatesCommandSet.js.map