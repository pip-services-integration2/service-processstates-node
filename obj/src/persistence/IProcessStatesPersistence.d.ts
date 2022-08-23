import { FilterParams, IOpenable } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { ProcessStateV1 } from '../data/version1/ProcessStateV1';
export interface IProcessStatesPersistence extends IOpenable {
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<ProcessStateV1>>;
    getOneById(correlationId: string, id: string): Promise<ProcessStateV1>;
    getListByIds(correlationId: string, ids: string[]): Promise<ProcessStateV1[]>;
    getActiveById(correlationId: string, id: string): Promise<ProcessStateV1>;
    getActiveByKey(correlationId: string, processType: string, processKey: string): Promise<ProcessStateV1>;
    getActiveByRequestId(correlationId: string, requestId: string): Promise<ProcessStateV1>;
    create(correlationId: string, item: ProcessStateV1): Promise<ProcessStateV1>;
    update(correlationId: string, item: ProcessStateV1): Promise<ProcessStateV1>;
    deleteById(correlationId: string, id: string): Promise<ProcessStateV1>;
    deleteByIds(correlationId: string, ids: string[]): Promise<void>;
    truncate(correlationId: string, timeout: number): Promise<void>;
}
