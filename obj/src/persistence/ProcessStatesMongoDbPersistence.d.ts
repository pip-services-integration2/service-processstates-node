import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-nodex';
import { ProcessStateV1 } from '../data/version1/ProcessStateV1';
import { IProcessStatesPersistence } from './IProcessStatesPersistence';
export declare class ProcessStatesMongoDbPersistence extends IdentifiableMongoDbPersistence<ProcessStateV1, string> implements IProcessStatesPersistence {
    constructor(name?: string);
    private toStringArray;
    private composeFilter;
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<ProcessStateV1>>;
    getActiveById(correlationId: string, id: string): Promise<ProcessStateV1>;
    getActiveByKey(correlationId: string, processType: string, processKey: string): Promise<ProcessStateV1>;
    getActiveByRequestId(correlationId: string, requestId: string): Promise<ProcessStateV1>;
    truncate(correlationId: string, timeout: number): Promise<void>;
}
