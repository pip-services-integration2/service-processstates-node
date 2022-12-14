import { FilterParams, IReferences } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { IReferenceable } from 'pip-services3-commons-nodex';
import { ICleanable } from 'pip-services3-commons-nodex';
import { ProcessStateV1 } from '../data/version1/ProcessStateV1';
import { IProcessStatesPersistence } from './IProcessStatesPersistence';
export declare class CompositeProcessStatesPersistence implements IProcessStatesPersistence, IConfigurable, IReferenceable, ICleanable {
    protected _activePersistence: IProcessStatesPersistence;
    protected _allPersistence: IProcessStatesPersistence;
    protected _opened: boolean;
    protected constructor(activePersistence: IProcessStatesPersistence, allPersistence: IProcessStatesPersistence);
    isOpen(): boolean;
    open(correlationId: string): Promise<void>;
    close(correlationId: string): Promise<void>;
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    clear(correlationId: any): Promise<void>;
    private toStringArray;
    isActiveQuery(filter: FilterParams): boolean;
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
