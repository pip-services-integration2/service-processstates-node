import { DataPage } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';

import { ProcessStateV1 } from '../data/version1/ProcessStateV1';
import { MessageV1 } from '../data/version1';

export interface IProcessStatesController {
    getProcesses(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<ProcessStateV1>>;

    getProcessById(correlationId: string, processId: string): Promise<ProcessStateV1>;

    startProcess(correlationId: string, processType: string, processKey: string,
        taskType: string, queueName: string, message: MessageV1, timeToLive: number): Promise<ProcessStateV1>;

    activateOrStartProcess(correlationId: string, processType: string, processKey: string,
        taskType: string, queueName: string, message: MessageV1, timeToLive: number): Promise<ProcessStateV1>;

    activateProcess(correlationId: string, processId: string,
        taskType: string, queueName: string, message: MessageV1): Promise<ProcessStateV1>;

    activateProcessByKey(correlationId: string, processType: string, processKey: string,
        taskType: string, queueName: string, message: MessageV1): Promise<ProcessStateV1>;

    rollbackProcess(correlationId: string, state: ProcessStateV1): Promise<void>;

    continueProcess(correlationId: string, state: ProcessStateV1): Promise<void>;

    continueAndRecoverProcess(correlationId: string, state: ProcessStateV1,
        recoveryQueue: string, recoveryMessage: MessageV1, recoveryTimeout: number): Promise<void>;

    repeatProcessRecovery(correlationId: string, state: ProcessStateV1, recoveryTimeout: number): Promise<void>;

    clearProcessRecovery(correlationId: string, state: ProcessStateV1): Promise<void>;

    failAndContinueProcess(correlationId: string, state: ProcessStateV1, errorMessage: string): Promise<void>;

    failAndRecoverProcess(correlationId: string, state: ProcessStateV1, errorMessage: string,
        recoveryQueue: string, recoveryMessage: MessageV1, recoveryTimeout: number): Promise<void>;

    suspendProcess(correlationId: string, state: ProcessStateV1, request: string,
        recoveryQueue: string, recoveryMessage: MessageV1, recoveryTimeout: number): Promise<void>;

    failProcess(correlationId: string, state: ProcessStateV1, errorMessage: string): Promise<void>;

    resumeProcess(correlationId: string, state: ProcessStateV1, comment: string): Promise<ProcessStateV1>;

    completeProcess(correlationId: string, state: ProcessStateV1): Promise<void>;

    abortProcess(correlationId: string, state: ProcessStateV1, comment: string): Promise<void>;

    updateProcess(correlationId: string, state: ProcessStateV1): Promise<ProcessStateV1>;

    deleteProcessById(correlationId: string, processId: string): Promise<ProcessStateV1>;

    requestProcessForResponse(correlationId: string, state: ProcessStateV1, request: string,
        recoveryQueueName: string, recoveryMessage: MessageV1): Promise<ProcessStateV1>;

    truncate(correlationId: string, timeout: number): Promise<void>;
}
