import { FilterParams, IReferences } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { IReferenceable } from 'pip-services3-commons-nodex';
import { ICleanable } from 'pip-services3-commons-nodex';

import { ProcessStateV1 } from '../data/version1/ProcessStateV1';
import { IProcessStatesPersistence } from './IProcessStatesPersistence';
import { ProcessStatusV1 } from '../data/version1';

export class CompositeProcessStatesPersistence
    implements IProcessStatesPersistence, IConfigurable, IReferenceable, ICleanable {
    protected _activePersistence: IProcessStatesPersistence;
    protected _allPersistence: IProcessStatesPersistence;
    protected _opened:boolean = false;

    protected constructor(activePersistence: IProcessStatesPersistence,
        allPersistence: IProcessStatesPersistence) {
        this._activePersistence = activePersistence;
        this._allPersistence = allPersistence;
    }

    isOpen(): boolean {
        return this._opened;
    }

    public async open(correlationId: string): Promise<void> {
        await this._activePersistence.open(correlationId);

        try {
            await this._allPersistence.open(correlationId);
        } catch (err) {
            await this._activePersistence.close(correlationId);
            throw err;
        }

        this._opened = true;
    }
    
    public async close(correlationId: string): Promise<void> {
        
        try {
            await this._activePersistence.close(correlationId);
            await this._allPersistence.close(correlationId);
            this._opened = false;

        } catch (err) {
            this._allPersistence.close(correlationId);
            throw err;
        }
    }

    public configure(config: ConfigParams): void {
        if (typeof this._allPersistence['configure'] === 'function')
            this._allPersistence['configure'](config);

        if (typeof this._activePersistence['configure'] === 'function') {
            let collection = config.getAsNullableString('collection');
            if (collection != null && collection.length > 0)
                config.setAsObject('collection', 'active_' + collection);

            this._activePersistence['configure'](config);

            if (collection != null && collection.length > 0)
                config.setAsObject('collection', collection);
        }
    }

    public setReferences(references: IReferences): void {
        if (typeof this._allPersistence['setReferences'] === 'function')
            this._allPersistence['setReferences'](references);

        if (this._activePersistence['setReferences'] === 'function')
            this._activePersistence['setReferences'](references);
    }

    public async clear(correlationId): Promise<void> {
        await Promise.all([
            this._activePersistence['clear'](correlationId),
            this._allPersistence['clear'](correlationId)
        ]);
    }

    private toStringArray(value: string): string[] {
        if (value == null) return null;
        let items = value.split(',');
        return items.length > 0 ? items : null;
    }

    public isActiveQuery(filter: FilterParams): boolean {
        if (filter == null)
            return false;

        let recoverd = filter.getAsNullableBoolean('recoverd');
        let expired = filter.getAsNullableBoolean('expired');
        if (recoverd || expired)
            return true;

        let status = filter.getAsNullableString('status');
        if (status != null) {
            return status != ProcessStatusV1.Completed
                && status != ProcessStatusV1.Aborted;
        }

        let statuses = this.toStringArray(filter.getAsNullableString('statuses'));
        if (statuses != null) {
            return statuses.indexOf(ProcessStatusV1.Completed) < 0
                && statuses.indexOf(ProcessStatusV1.Aborted) < 0;
        }

        return false;
    }

    public async getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<ProcessStateV1>> {
        if (this.isActiveQuery(filter))
            return await this._activePersistence.getPageByFilter(correlationId, filter, paging);
        else
            return await this._allPersistence.getPageByFilter(correlationId, filter, paging);
    }

    public async getOneById(correlationId: string, id: string): Promise<ProcessStateV1> {
        return await this._allPersistence.getOneById(correlationId, id);
    }

    public async getListByIds(correlationId: string, ids: string[]): Promise<ProcessStateV1[]> {
        return await this._allPersistence.getListByIds(correlationId, ids);
    }

    public async getActiveById(correlationId: string, id: string): Promise<ProcessStateV1> {
        return await this._activePersistence.getActiveById(correlationId, id);     
    }
            
    public async getActiveByKey(correlationId: string, processType: string, processKey: string): Promise<ProcessStateV1> {
        return await this._activePersistence.getActiveByKey(correlationId, processType, processKey);     
    }

    public async getActiveByRequestId(correlationId: string, requestId: string): Promise<ProcessStateV1> {
        return await this._activePersistence.getActiveByRequestId(correlationId, requestId);     
    }
            
    public async create(correlationId: string, item: ProcessStateV1): Promise<ProcessStateV1> {
        let activeItem: ProcessStateV1;
        let resultItem: ProcessStateV1;

        if (item.status == ProcessStatusV1.Starting
            || item.status == ProcessStatusV1.Running
            || item.status == ProcessStatusV1.Suspended
            || item.status == ProcessStatusV1.Failed) {
            activeItem = await this._activePersistence.create(correlationId, item);
        }

        resultItem = await this._allPersistence.create(correlationId, item);
            
        if (activeItem != null && resultItem == null) {
            try {
                await this._activePersistence.deleteById(correlationId, activeItem.id);
            } catch (err) {
                // Do nothing...
            }
        }
        
        return resultItem;
    }

    public async update(correlationId: string, item: ProcessStateV1): Promise<ProcessStateV1> {
        let resultItem: ProcessStateV1;

        let tasks = [];

        if (item.status == ProcessStatusV1.Starting
            || item.status == ProcessStatusV1.Running
            || item.status == ProcessStatusV1.Suspended
            || item.status == ProcessStatusV1.Failed) {
            tasks.push(this._activePersistence.update(correlationId, item));
        } else {
            tasks.push(this._activePersistence.deleteById(correlationId, item.id));
        }

        tasks.push(this._allPersistence.update(correlationId, item));
        
        let res = await Promise.all(tasks);
        resultItem = res[res.length - 1];
        
        return resultItem;
    }

    public async deleteById(correlationId: string, id: string): Promise<ProcessStateV1> {
        await this._activePersistence.deleteById(correlationId, id);

        let resultItem: ProcessStateV1 = await this._allPersistence.deleteById(correlationId, id);
        
        return resultItem;
    }

    public async deleteByIds(correlationId: string, ids: string[]): Promise<void> {
        await this._activePersistence.deleteByIds(correlationId, ids);
        await this._allPersistence.deleteByIds(correlationId, ids);
    }

    public async truncate(correlationId: string, timeout: number): Promise<void> {
        await this._allPersistence.truncate(correlationId, timeout);
    }
}
