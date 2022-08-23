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
exports.ProcessStatesController = void 0;
const version1_1 = require("../data/version1");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const ProcessLockManager_1 = require("./ProcessLockManager");
const ProcessStatesManager_1 = require("./ProcessStatesManager");
const TasksManager_1 = require("./TasksManager");
const RecoveryManager_1 = require("./RecoveryManager");
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const ProcessStatesCommandSet_1 = require("./ProcessStatesCommandSet");
class ProcessStatesController {
    constructor() {
        this._logger = new pip_services3_components_nodex_1.CompositeLogger();
        this._counters = new pip_services3_components_nodex_1.CompositeCounters();
        this._opened = false;
    }
    getCommandSet() {
        this._commandset = this._commandset || new ProcessStatesCommandSet_1.ProcessStatesCommandSet(this);
        return this._commandset;
    }
    configure(config) {
        this._config = config;
    }
    isOpen() {
        return this._opened;
    }
    open(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._opened = true;
            this._logger.info(correlationId, "Process state controller is opened");
        });
    }
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this._opened = false;
            this._logger.info(correlationId, "Process state controller is closed");
        });
    }
    setReferences(references) {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._persistence = references.getOneRequired(new pip_services3_commons_nodex_1.Descriptor("service-processstates", "persistence", "*", "*", "1.0"));
    }
    _getProcess(processType, processKey, initiatorId, errEnable = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (processType == null) {
                throw new pip_services3_commons_nodex_1.ApplicationException("Process type cannot be null");
            }
            if (processKey == null && initiatorId == null) {
                throw new pip_services3_commons_nodex_1.ApplicationException("Process key or initiator id must be present");
            }
            // Use either one to locate the right process
            if (processKey != null) {
                let item = yield this._persistence.getActiveByKey(" ", processType, processKey);
                if (item == null && errEnable)
                    throw new pip_services3_commons_nodex_1.ApplicationException("Process with key " + processKey + " was does not exist"); //ProcessNotFoundException
                return item;
            }
            else {
                let item = yield this._persistence.getActiveById(processType, initiatorId);
                if (item == null && errEnable)
                    throw new pip_services3_commons_nodex_1.ApplicationException("Process with key " + processKey + " was does not exist"); //ProcessNotFoundException
                return item;
            }
        });
    }
    _getProcessById(processId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (processId == null)
                throw new pip_services3_commons_nodex_1.BadRequestException("Process id cannot be null");
            let process = yield this._persistence.getActiveById("", processId);
            if (process == null)
                throw new version1_1.ProcessNotFoundExceptionV1("Process with id " + processId + " was does not exist");
            return process;
        });
    }
    _getProcessByState(state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (state == null)
                throw new pip_services3_commons_nodex_1.BadRequestException("Process state cannot be null");
            return yield this._getProcessById(state.id);
        });
    }
    _getActiveProcess(state) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getProcessByState(state);
            var checkRes = ProcessLockManager_1.ProcessLockManager.checkLocked(state);
            if (checkRes)
                throw checkRes;
            // Relax rules for now - uncomment later
            //ProcessLockHandler.CheckLockValid(state);
            checkRes = ProcessStatesManager_1.ProcessStatesManager.checkActive(process);
            if (checkRes)
                throw checkRes;
            checkRes = ProcessLockManager_1.ProcessLockManager.checkLocked(process);
            if (checkRes)
                throw checkRes;
            checkRes = ProcessLockManager_1.ProcessLockManager.checkLockMatches(state, process);
            if (checkRes)
                throw checkRes;
            return process;
        });
    }
    getProcesses(correlationId, filter, paging) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._persistence.getPageByFilter(correlationId, filter, paging);
        });
    }
    getProcessById(correlationId, processId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (processId == null)
                throw new pip_services3_commons_nodex_1.BadRequestException("Process id cannot be null");
            return yield this._persistence.getOneById(correlationId, processId);
        });
    }
    startProcess(correlationId, processType, processKey, taskType, queueName, message, timeToLive = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            //var process = processKey != null ? await GetProcessAsync(processType, processKey, false) : null;
            let process = yield this._getProcess(processType, processKey, message != null ? message.correlation_id : null, false);
            if (process == null) {
                // Starting a new process
                process = ProcessStatesManager_1.ProcessStatesManager.startProcess(processType, processKey, timeToLive);
                ProcessLockManager_1.ProcessLockManager.lockProcess(process, taskType);
                TasksManager_1.TasksManager.startTasks(process, taskType, queueName, message);
                // Assign initiator id for processs created without key
                process.request_id = processKey == null ? message.correlation_id : null;
                return yield this._persistence.create(correlationId, process);
            }
            else {
                var checkRes = ProcessLockManager_1.ProcessLockManager.checkNotLocked(process);
                if (checkRes)
                    throw checkRes;
                // If it's active throw exception
                if (process.status != version1_1.ProcessStatusV1.Starting)
                    throw new version1_1.ProcessAlreadyExistExceptionV1("Process with key " + processKey + " already exist");
                ProcessLockManager_1.ProcessLockManager.lockProcess(process, taskType);
                TasksManager_1.TasksManager.failTasks(process, "Lock timeout expired");
                TasksManager_1.TasksManager.startTasks(process, taskType, queueName, message);
                return yield this._persistence.update(correlationId, process);
            }
        });
    }
    activateOrStartProcess(correlationId, processType, processKey, taskType, queueName, message, timeToLive = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getProcess(processType, processKey, message != null ? message.correlation_id : null, false);
            if (process == null) {
                // Starting a new process
                let item = ProcessStatesManager_1.ProcessStatesManager.startProcess(processType, processKey, timeToLive);
                process = item;
                TasksManager_1.TasksManager.startTasks(process, taskType, queueName, message);
                ProcessLockManager_1.ProcessLockManager.lockProcess(process, taskType);
                // Assign initiator id for processs created without key
                process.request_id = processKey == null ? message.correlation_id : null;
                return yield this._persistence.create(correlationId, process);
            }
            else {
                let checkRes = ProcessLockManager_1.ProcessLockManager.checkNotLocked(process);
                if (checkRes)
                    throw checkRes;
                checkRes = ProcessStatesManager_1.ProcessStatesManager.checkActive(process);
                if (checkRes)
                    throw checkRes;
                //ProcessStateHandler.CheckNotExpired(process);
                ProcessLockManager_1.ProcessLockManager.lockProcess(process, taskType);
                TasksManager_1.TasksManager.failTasks(process, "Lock timeout expired");
                TasksManager_1.TasksManager.startTasks(process, taskType, queueName, message);
                return yield this._persistence.update(correlationId, process);
            }
        });
    }
    activateProcess(correlationId, processId, taskType, queueName, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getProcessById(processId);
            let checkRes = ProcessLockManager_1.ProcessLockManager.checkNotLocked(process);
            if (checkRes)
                throw checkRes;
            checkRes = ProcessStatesManager_1.ProcessStatesManager.checkActive(process);
            if (checkRes)
                throw checkRes;
            //ProcessStateHandler.CheckNotExpired(process);
            ProcessLockManager_1.ProcessLockManager.lockProcess(process, taskType);
            TasksManager_1.TasksManager.failTasks(process, "Lock timeout expired");
            TasksManager_1.TasksManager.startTasks(process, taskType, queueName, message);
            return yield this._persistence.update(correlationId, process);
        });
    }
    activateProcessByKey(correlationId, processType, processKey, taskType, queueName, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getProcess(processType, processKey, null, true);
            let checkRes = ProcessLockManager_1.ProcessLockManager.checkNotLocked(process);
            if (checkRes)
                throw checkRes;
            checkRes = ProcessStatesManager_1.ProcessStatesManager.checkActive(process);
            if (checkRes)
                throw checkRes;
            //ProcessStateHandler.CheckNotExpired(process);
            ProcessLockManager_1.ProcessLockManager.lockProcess(process, taskType);
            TasksManager_1.TasksManager.failTasks(process, "Lock timeout expired");
            TasksManager_1.TasksManager.startTasks(process, taskType, queueName, message);
            process = yield this._persistence.update(correlationId, process);
            return process;
        });
    }
    continueProcess(correlationId, state) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getActiveProcess(state);
            ProcessLockManager_1.ProcessLockManager.unlockProcess(process);
            TasksManager_1.TasksManager.completeTasks(process);
            ProcessStatesManager_1.ProcessStatesManager.continueProcess(process);
            RecoveryManager_1.RecoveryManager.clearRecovery(process);
            // Copy process data
            process.data = state.data || process.data;
            yield this._persistence.update(correlationId, process);
        });
    }
    continueAndRecoverProcess(correlationId, state, recoveryQueueName, recoveryMessage, recoveryTimeout) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getActiveProcess(state);
            ProcessLockManager_1.ProcessLockManager.unlockProcess(process);
            TasksManager_1.TasksManager.completeTasks(process);
            ProcessStatesManager_1.ProcessStatesManager.continueProcess(process);
            RecoveryManager_1.RecoveryManager.setRecovery(process, recoveryQueueName, recoveryMessage, recoveryTimeout);
            // Copy process data
            process.data = state.data || process.data;
            yield this._persistence.update(correlationId, process);
        });
    }
    repeatProcessRecovery(correlationId, state, recoveryTimeout = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getActiveProcess(state);
            ProcessLockManager_1.ProcessLockManager.unlockProcess(process);
            TasksManager_1.TasksManager.completeTasks(process);
            ProcessStatesManager_1.ProcessStatesManager.repeatProcessActivation(process);
            RecoveryManager_1.RecoveryManager.setRecovery(process, null, null, recoveryTimeout);
            // Copy process data
            process.data = state.data || process.data;
            yield this._persistence.update(correlationId, process);
        });
    }
    rollbackProcess(correlationId, state) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getActiveProcess(state);
            // For started process just remove them
            if (process.status == version1_1.ProcessStatusV1.Starting) {
                yield this._persistence.deleteById(correlationId, process.id);
            }
            else {
                ProcessLockManager_1.ProcessLockManager.unlockProcess(process);
                TasksManager_1.TasksManager.rollbackTasks(process);
                ProcessStatesManager_1.ProcessStatesManager.repeatProcessActivation(process);
                RecoveryManager_1.RecoveryManager.retryRecovery(process);
                // Copy process data
                process.data = state.data || process.data;
                yield this._persistence.update(correlationId, process);
            }
        });
    }
    requestProcessForResponse(correlationId, state, request, recoveryQueueName, recoveryMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getActiveProcess(state);
            ProcessLockManager_1.ProcessLockManager.unlockProcess(process);
            TasksManager_1.TasksManager.completeTasks(process);
            ProcessStatesManager_1.ProcessStatesManager.requestProcessResponse(process, request);
            RecoveryManager_1.RecoveryManager.setRecovery(process, recoveryQueueName, recoveryMessage);
            // Copy process data
            process.data = state.data || process.data;
            process = yield this._persistence.update(correlationId, process);
            return process;
        });
    }
    failAndContinueProcess(correlationId, state, errorMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getActiveProcess(state);
            ProcessLockManager_1.ProcessLockManager.unlockProcess(process);
            TasksManager_1.TasksManager.failTasks(process, errorMessage);
            ProcessStatesManager_1.ProcessStatesManager.repeatProcessActivation(process);
            RecoveryManager_1.RecoveryManager.clearRecovery(process);
            // Copy process data
            process.data = state.data || process.data;
            yield this._persistence.update(correlationId, process);
        });
    }
    failAndRecoverProcess(correlationId, state, errorMessage, recoveryQueueName, recoveryMessage, recoveryTimeout = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getActiveProcess(state);
            ProcessLockManager_1.ProcessLockManager.unlockProcess(process);
            TasksManager_1.TasksManager.failTasks(process, errorMessage);
            ProcessStatesManager_1.ProcessStatesManager.repeatProcessActivation(process);
            //ProcessStatesManager.ActivateProcessWithFailure(process);
            RecoveryManager_1.RecoveryManager.setRecovery(process, recoveryQueueName, recoveryMessage, recoveryTimeout);
            // Copy process data
            process.data = state.data || process.data;
            yield this._persistence.update(correlationId, process);
        });
    }
    failProcess(correlationId, state, errorMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getProcessByState(state);
            ProcessLockManager_1.ProcessLockManager.unlockProcess(process);
            TasksManager_1.TasksManager.failTasks(process, errorMessage);
            ProcessStatesManager_1.ProcessStatesManager.failProcess(process);
            RecoveryManager_1.RecoveryManager.clearRecovery(process);
            // Copy process data
            process.data = state.data || process.data;
            yield this._persistence.update(correlationId, process);
        });
    }
    resumeProcess(correlationId, state, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getProcessByState(state);
            let checkRes = ProcessStatesManager_1.ProcessStatesManager.checkPending(process);
            if (checkRes)
                throw checkRes;
            ProcessLockManager_1.ProcessLockManager.unlockProcess(process);
            if (TasksManager_1.TasksManager.hasCompletedTasks(process))
                ProcessStatesManager_1.ProcessStatesManager.continueProcess(process);
            else
                ProcessStatesManager_1.ProcessStatesManager.restartProcess(process);
            RecoveryManager_1.RecoveryManager.setRecovery(process, state.recovery_queue_name, state.recovery_message, 0);
            ProcessStatesManager_1.ProcessStatesManager.extendProcessExpiration(process);
            // Copy process data
            process.data = state.data || process.data;
            process.comment = comment;
            return yield this._persistence.update(correlationId, process);
        });
    }
    abortProcess(correlationId, state, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getProcessByState(state);
            ProcessLockManager_1.ProcessLockManager.unlockProcess(process);
            TasksManager_1.TasksManager.failTasks(process, "Lock timeout expired");
            ProcessStatesManager_1.ProcessStatesManager.abortProcess(process);
            RecoveryManager_1.RecoveryManager.clearRecovery(process);
            // Copy over process data
            process.data = state.data || process.data;
            process.comment = comment;
            yield this._persistence.update(correlationId, process);
        });
    }
    completeProcess(correlationId, state) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getActiveProcess(state);
            ProcessLockManager_1.ProcessLockManager.unlockProcess(process);
            TasksManager_1.TasksManager.completeTasks(process);
            ProcessStatesManager_1.ProcessStatesManager.completeProcess(process);
            RecoveryManager_1.RecoveryManager.clearRecovery(process);
            // Copy process data
            process.data = state.data || process.data;
            yield this._persistence.update(correlationId, process);
        });
    }
    clearProcessRecovery(correlationId, state) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getProcessByState(state);
            RecoveryManager_1.RecoveryManager.clearRecovery(process);
            yield this._persistence.update(correlationId, process);
        });
    }
    updateProcess(correlationId, state) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._persistence.update(correlationId, state);
        });
    }
    deleteProcessById(correlationId, processId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._persistence.deleteById(correlationId, processId);
        });
    }
    suspendProcess(correlationId, state, request, recoveryQueue, recoveryMessage, recoveryTimeout) {
        return __awaiter(this, void 0, void 0, function* () {
            let process = yield this._getActiveProcess(state);
            ProcessLockManager_1.ProcessLockManager.unlockProcess(process);
            ProcessStatesManager_1.ProcessStatesManager.requestProcessResponse(process, request);
            RecoveryManager_1.RecoveryManager.setRecovery(process, recoveryQueue, recoveryMessage, recoveryTimeout);
            // Copy process data
            process.data = state.data || process.data;
            yield this._persistence.update(correlationId, process);
        });
    }
    truncate(correlationId, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._persistence.truncate(correlationId, timeout);
        });
    }
}
exports.ProcessStatesController = ProcessStatesController;
//# sourceMappingURL=ProcessStatesController.js.map