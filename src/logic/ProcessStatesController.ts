import { IProcessStatesPersistence } from '../persistence/IProcessStatesPersistence';
import { ProcessStateV1, ProcessNotFoundExceptionV1, ProcessStatusV1, ProcessAlreadyExistExceptionV1, MessageV1 } from '../data/version1';
import { 
    ApplicationException, BadRequestException, DataPage, FilterParams, 
    PagingParams, IReferences, IOpenable, IConfigurable, ConfigParams, 
    IReconfigurable, Descriptor, ICommandable, CommandSet 
} from 'pip-services3-commons-nodex';
import { ProcessLockManager } from './ProcessLockManager';
import { ProcessStatesManager } from './ProcessStatesManager';
import { TasksManager } from './TasksManager';
import { RecoveryManager } from './RecoveryManager';
import { IProcessStatesController } from './IProcessStatesController';
import { CompositeLogger, CompositeCounters } from 'pip-services3-components-nodex';
import { ProcessStatesCommandSet } from './ProcessStatesCommandSet';


export class ProcessStatesController implements IProcessStatesController, IOpenable, IConfigurable, IReconfigurable, ICommandable {

    private _persistence: IProcessStatesPersistence;

    //private _references: IReferences;
    private _config: ConfigParams
    
    private _logger: CompositeLogger = new CompositeLogger();
    private _counters: CompositeCounters = new CompositeCounters();
    protected _opened: boolean = false;
    private _commandset: CommandSet;


    public constructor() {
    }

    public getCommandSet(): CommandSet {
        this._commandset = this._commandset || new ProcessStatesCommandSet(this);
        return this._commandset;
    }

    public configure(config: ConfigParams): void {
        this._config = config;
    }

    public isOpen(): boolean {
        return this._opened;
    }

    public async open(correlationId: string): Promise<void> {
        this._opened = true;
        this._logger.info(correlationId, "Process state controller is opened");
    }

    public async close(correlationId: string): Promise<void>  {
        this._opened = false;
        this._logger.info(correlationId, "Process state controller is closed");
    }

    public setReferences(references: IReferences) {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._persistence = references.getOneRequired<IProcessStatesPersistence>(new Descriptor(
            "service-processstates", "persistence", "*", "*", "1.0"));
    }

    private async _getProcess(
        processType: string, processKey: string, initiatorId: string, errEnable: boolean = true): Promise<ProcessStateV1> {
        if (processType == null) {
            throw new ApplicationException("Process type cannot be null")
        }
        if (processKey == null && initiatorId == null) {
            throw new ApplicationException("Process key or initiator id must be present")
        }

        // Use either one to locate the right process
        if (processKey != null) {
            let item = await this._persistence.getActiveByKey(" ", processType, processKey);
            if (item == null && errEnable) 
                throw new ApplicationException("Process with key " + processKey + " was does not exist"); //ProcessNotFoundException
            
            return item;
        } else {
            let item = await this._persistence.getActiveById(processType, initiatorId);
            if (item == null && errEnable)
                throw new ApplicationException("Process with key " + processKey + " was does not exist"); //ProcessNotFoundException
            
            return item;
        }
    }

    private async _getProcessById(processId: string): Promise<ProcessStateV1> {
        if (processId == null)
            throw new BadRequestException("Process id cannot be null");
        

        let process = await this._persistence.getActiveById("", processId);

        if (process == null)
            throw new ProcessNotFoundExceptionV1("Process with id " + processId + " was does not exist");
        
        return process;
    }

    private async _getProcessByState(state: ProcessStateV1): Promise<ProcessStateV1> {
        if (state == null)
            throw new BadRequestException("Process state cannot be null");

        return await this._getProcessById(state.id);
    }

    private async _getActiveProcess(state: ProcessStateV1): Promise<ProcessStateV1> {
        let process = await this._getProcessByState(state);
        var checkRes = ProcessLockManager.checkLocked(state);
        if (checkRes)
            throw checkRes;
        
        // Relax rules for now - uncomment later
        //ProcessLockHandler.CheckLockValid(state);
        checkRes = ProcessStatesManager.checkActive(process);
        if (checkRes)
            throw checkRes;
        
        checkRes = ProcessLockManager.checkLocked(process);
        if (checkRes)
            throw checkRes;
        
        checkRes = ProcessLockManager.checkLockMatches(state, process);
        if (checkRes)
            throw checkRes;
                
        return process;
    }

    public async getProcesses(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<ProcessStateV1>> {
        return await this._persistence.getPageByFilter(correlationId, filter, paging);
    }

    public async getProcessById(correlationId: string, processId: string): Promise<ProcessStateV1> {
        if (processId == null)
            throw new BadRequestException("Process id cannot be null");
        
        return await this._persistence.getOneById(correlationId, processId);
    }

    public async startProcess(correlationId: string, processType: string, processKey: string,
        taskType: string, queueName: string, message: MessageV1, timeToLive: number = 0): Promise<ProcessStateV1> {
        //var process = processKey != null ? await GetProcessAsync(processType, processKey, false) : null;
        let process = await this._getProcess(processType, processKey, message != null ? message.correlation_id : null, false);

        if (process == null) {
            // Starting a new process
            process = ProcessStatesManager.startProcess(processType, processKey, timeToLive);
            ProcessLockManager.lockProcess(process, taskType);
            TasksManager.startTasks(process, taskType, queueName, message);
            
            // Assign initiator id for processs created without key
            process.request_id = processKey == null ? message.correlation_id : null;
            return await this._persistence.create(correlationId, process);
        }
        else {
            var checkRes = ProcessLockManager.checkNotLocked(process);

            if (checkRes)
                throw checkRes;

            // If it's active throw exception
            if (process.status != ProcessStatusV1.Starting)
                throw new ProcessAlreadyExistExceptionV1("Process with key " + processKey + " already exist");

            ProcessLockManager.lockProcess(process, taskType);
            TasksManager.failTasks(process, "Lock timeout expired");
            TasksManager.startTasks(process, taskType, queueName, message);
            return await this._persistence.update(correlationId, process);
        }
    }

    public async activateOrStartProcess(correlationId: string, processType: string, processKey: string,
        taskType: string, queueName: string, message: MessageV1, timeToLive: number = 0): Promise<ProcessStateV1> {
        let process = await this._getProcess(processType, processKey, message != null ? message.correlation_id : null, false); 

        if (process == null) {
            // Starting a new process
            let item = ProcessStatesManager.startProcess(processType, processKey, timeToLive);
            process = item;
            TasksManager.startTasks(process, taskType, queueName, message);
            ProcessLockManager.lockProcess(process, taskType);
            // Assign initiator id for processs created without key
            process.request_id = processKey == null ? message.correlation_id : null;
            return await this._persistence.create(correlationId, process);
        } else {
            let checkRes = ProcessLockManager.checkNotLocked(process);
            if (checkRes)
                throw checkRes;
    
            checkRes = ProcessStatesManager.checkActive(process);
            if (checkRes)
                throw checkRes;
            
            //ProcessStateHandler.CheckNotExpired(process);
            ProcessLockManager.lockProcess(process, taskType);
            TasksManager.failTasks(process, "Lock timeout expired");
            TasksManager.startTasks(process, taskType, queueName, message);
            return await this._persistence.update(correlationId, process);
        }
    }

    public async activateProcess(correlationId: string, processId: string, taskType: string,
        queueName: string, message: MessageV1): Promise<ProcessStateV1> {
        let process = await this._getProcessById(processId);

        let checkRes = ProcessLockManager.checkNotLocked(process);
        if (checkRes)
            throw checkRes;
        
        checkRes = ProcessStatesManager.checkActive(process);
        if (checkRes)
            throw checkRes
        
        //ProcessStateHandler.CheckNotExpired(process);
        ProcessLockManager.lockProcess(process, taskType);
        TasksManager.failTasks(process, "Lock timeout expired");
        TasksManager.startTasks(process, taskType, queueName, message);

        return await this._persistence.update(correlationId, process);
    }

    public async activateProcessByKey(correlationId: string, processType: string, processKey: string,
        taskType: string, queueName: string, message: MessageV1): Promise<ProcessStateV1> {
        let process = await this._getProcess(processType, processKey, null, true);

        let checkRes = ProcessLockManager.checkNotLocked(process);
        if (checkRes)
            throw checkRes;
        
        checkRes = ProcessStatesManager.checkActive(process);
        if (checkRes)
            throw checkRes;
        
        //ProcessStateHandler.CheckNotExpired(process);
        ProcessLockManager.lockProcess(process, taskType);
        TasksManager.failTasks(process, "Lock timeout expired");
        TasksManager.startTasks(process, taskType, queueName, message);

        process = await this._persistence.update(correlationId, process);
        return process;
    }


    public async continueProcess(correlationId: string, state: ProcessStateV1): Promise<void> {
        let process = await this._getActiveProcess(state);

        ProcessLockManager.unlockProcess(process);
        TasksManager.completeTasks(process);
        ProcessStatesManager.continueProcess(process);
        RecoveryManager.clearRecovery(process);
        // Copy process data
        process.data = state.data || process.data;
        await this._persistence.update(correlationId, process);
    }

    public async continueAndRecoverProcess(correlationId: string, state: ProcessStateV1,
        recoveryQueueName: string, recoveryMessage: MessageV1, recoveryTimeout: number): Promise<void> {
        let process = await this._getActiveProcess(state);

        ProcessLockManager.unlockProcess(process);
        TasksManager.completeTasks(process);
        ProcessStatesManager.continueProcess(process);
        RecoveryManager.setRecovery(process, recoveryQueueName, recoveryMessage, recoveryTimeout);
        // Copy process data
        process.data = state.data || process.data;
        await this._persistence.update(correlationId, process);
    }

    public async repeatProcessRecovery(correlationId: string, state: ProcessStateV1, recoveryTimeout: number = 0): Promise<void> {
        let process = await this._getActiveProcess(state);

        ProcessLockManager.unlockProcess(process);
        TasksManager.completeTasks(process);
        ProcessStatesManager.repeatProcessActivation(process);
        RecoveryManager.setRecovery(process, null, null, recoveryTimeout);
        // Copy process data
        process.data = state.data || process.data;
        await this._persistence.update(correlationId, process);
    }

    public async rollbackProcess(correlationId: string, state: ProcessStateV1): Promise<void> {
        let process = await this._getActiveProcess(state);

        // For started process just remove them
        if (process.status == ProcessStatusV1.Starting) {
            await this._persistence.deleteById(correlationId, process.id);
        } else {
            ProcessLockManager.unlockProcess(process);
            TasksManager.rollbackTasks(process);
            ProcessStatesManager.repeatProcessActivation(process);
            RecoveryManager.retryRecovery(process);
            // Copy process data
            process.data = state.data || process.data;
            await this._persistence.update(correlationId, process);
        }
    }

    public async requestProcessForResponse(correlationId: string, state: ProcessStateV1, request: string,
        recoveryQueueName: string, recoveryMessage: MessageV1): Promise<ProcessStateV1> {
        let process = await this._getActiveProcess(state);

        ProcessLockManager.unlockProcess(process);
        TasksManager.completeTasks(process);
        ProcessStatesManager.requestProcessResponse(process, request);
        RecoveryManager.setRecovery(process, recoveryQueueName, recoveryMessage);
        // Copy process data
        process.data = state.data || process.data;
        process = await this._persistence.update(correlationId, process);
        return process;
    }

    public async failAndContinueProcess(correlationId: string, state: ProcessStateV1, errorMessage: string): Promise<void> {
        let process = await this._getActiveProcess(state);

        ProcessLockManager.unlockProcess(process);
        TasksManager.failTasks(process, errorMessage);
        ProcessStatesManager.repeatProcessActivation(process);
        RecoveryManager.clearRecovery(process);
        // Copy process data
        process.data = state.data || process.data;
        await this._persistence.update(correlationId, process);
    }

    public async failAndRecoverProcess(correlationId: string, state: ProcessStateV1, errorMessage: string,
        recoveryQueueName: string, recoveryMessage: MessageV1, recoveryTimeout: number = 0): Promise<void> {
        let process = await this._getActiveProcess(state);

        ProcessLockManager.unlockProcess(process);
        TasksManager.failTasks(process, errorMessage);
        ProcessStatesManager.repeatProcessActivation(process);
        //ProcessStatesManager.ActivateProcessWithFailure(process);
        RecoveryManager.setRecovery(process, recoveryQueueName, recoveryMessage, recoveryTimeout);

        // Copy process data
        process.data = state.data || process.data;

        await this._persistence.update(correlationId, process);
    }

    public async failProcess(correlationId: string, state: ProcessStateV1, errorMessage: string): Promise<void> {
        let process = await this._getProcessByState(state);

        ProcessLockManager.unlockProcess(process);
        TasksManager.failTasks(process, errorMessage);
        ProcessStatesManager.failProcess(process);
        RecoveryManager.clearRecovery(process);
        // Copy process data
        process.data = state.data || process.data;
        await this._persistence.update(correlationId, process);
    }

    public async resumeProcess(correlationId: string, state: ProcessStateV1, comment: string): Promise<ProcessStateV1> {
        let process = await this._getProcessByState(state);

        let checkRes = ProcessStatesManager.checkPending(process);
        if (checkRes)
            throw checkRes;
        
        ProcessLockManager.unlockProcess(process);
        if (TasksManager.hasCompletedTasks(process))
            ProcessStatesManager.continueProcess(process);
        else
            ProcessStatesManager.restartProcess(process);
        RecoveryManager.setRecovery(process, state.recovery_queue_name, state.recovery_message, 0);
        ProcessStatesManager.extendProcessExpiration(process);
        // Copy process data
        process.data = state.data || process.data;
        process.comment = comment;
        return await this._persistence.update(correlationId, process);
    }

    public async abortProcess(correlationId: string, state: ProcessStateV1, comment: string): Promise<void> {
        let process = await this._getProcessByState(state);

        ProcessLockManager.unlockProcess(process);
        TasksManager.failTasks(process, "Lock timeout expired");
        ProcessStatesManager.abortProcess(process);
        RecoveryManager.clearRecovery(process);
        // Copy over process data
        process.data = state.data || process.data;
        process.comment = comment;
        await this._persistence.update(correlationId, process);
    }

    public async completeProcess(correlationId: string, state: ProcessStateV1): Promise<void> {
        let process = await this._getActiveProcess(state);

        ProcessLockManager.unlockProcess(process);
        TasksManager.completeTasks(process);
        ProcessStatesManager.completeProcess(process);
        RecoveryManager.clearRecovery(process);
        // Copy process data
        process.data = state.data || process.data;
        await this._persistence.update(correlationId, process);
    }

    public async clearProcessRecovery(correlationId: string, state: ProcessStateV1): Promise<void> {
        let process = await this._getProcessByState(state);

        RecoveryManager.clearRecovery(process);
        await this._persistence.update(correlationId, process);
    }

    public async updateProcess(correlationId: string, state: ProcessStateV1): Promise<ProcessStateV1> {
        return await this._persistence.update(correlationId, state);
    }

    public async deleteProcessById(correlationId: string, processId: string): Promise<ProcessStateV1> {
        return await this._persistence.deleteById(correlationId, processId);
    }

    public async suspendProcess(correlationId: string, state: ProcessStateV1, request: string,
        recoveryQueue: string, recoveryMessage: MessageV1, recoveryTimeout: number): Promise<void> {
        let process = await this._getActiveProcess(state);

        ProcessLockManager.unlockProcess(process);
        ProcessStatesManager.requestProcessResponse(process, request);
        RecoveryManager.setRecovery(process, recoveryQueue, recoveryMessage, recoveryTimeout);

        // Copy process data
        process.data = state.data || process.data;
        await this._persistence.update(correlationId, process);
    }

    public async truncate(correlationId: string, timeout: number): Promise<void> {
        return await this._persistence.truncate(correlationId, timeout);
    }
}