import { IReferences } from 'pip-services3-commons-nodex';
import { ILogger } from 'pip-services3-components-nodex';
import { ProcessStateV1 } from '../data/version1/ProcessStateV1';
export declare class RecoveryController {
    private _references;
    private _logger;
    constructor(references: IReferences, logger?: ILogger);
    isRecoveryDue(status: ProcessStateV1): boolean;
    isAttemptsExceeded(status: ProcessStateV1): boolean;
    sendRecovery(status: ProcessStateV1): Promise<boolean>;
    private _convertToMessageEnvelope;
}
