import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { IdentifiableMemoryPersistence } from 'pip-services3-data-nodex';

import { ProcessStateV1 } from '../data/version1/ProcessStateV1';
import { IProcessStatesPersistence } from './IProcessStatesPersistence';
import { ProcessStatusV1 } from '../data/version1';

export class ProcessStatesMemoryPersistence 
    extends IdentifiableMemoryPersistence<ProcessStateV1, string> 
    implements IProcessStatesPersistence {

    constructor() {
        super();
    }

    private toStringArray(value: string): string[] {
        if (value == null) return null;
        let items = value.split(',');
        return items.length > 0 ? items : null;
    }

    private matchString(value: string, search: string): boolean {
        if (value == null && search == null)
            return true;
        if (value == null || search == null)
            return false;
        return value.toLowerCase().indexOf(search.toLowerCase()) >= 0;
    }

    private matchSearch(status: ProcessStateV1, search: string): boolean {
        if (this.matchString(status.id, search))
            return true;
        if (this.matchString(status.type, search))
            return true;
        if (this.matchString(status.key, search))
            return true;
        if (this.matchString(status.status, search))
            return true;
        return false;
    }

    private composeFilter(filter: FilterParams): any {
        filter = filter || new FilterParams();
        
        let id = filter.getAsNullableString('id');
        let type = filter.getAsNullableString('type');
        let status = filter.getAsNullableString('status');
        let statuses = this.toStringArray(filter.getAsNullableString('statuses'));
        let key = filter.getAsNullableString('key');
        let recovered = filter.getAsNullableBoolean('recovered');
        let expired = filter.getAsNullableBoolean('expired');
        let fromTime = filter.getAsNullableDateTime('from_time');
        let toTime = filter.getAsNullableDateTime('to_time');
        let search = filter.getAsNullableString('search');

        let now = new Date().getTime();
        
        return (item: ProcessStateV1) => {
            if (id && item.id != id) 
                return false;
            if (type && item.type != type) 
                return false;
            if (status && item.status != status) 
                return false;
            if (statuses && statuses.indexOf(item.status) < 0)
                return false;
            if (key && item.key != key) 
                return false;
            if (recovered == true && (item.recovery_time == null || item.recovery_time.getTime() >= now)) 
                return false;
            if (expired == true && (item.expiration_time == null || item.expiration_time.getTime() >= now)) 
                return false;
            if (fromTime && item.start_time.getTime() < fromTime.getTime())
                return false;
            if (toTime && item.start_time.getTime() > toTime.getTime())
                return false;
            if (search != null && !this.matchSearch(item, search))
                return false;
            return true; 
        };
    }

    public async getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<ProcessStateV1>> {
        return await super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null);
    }
            
    public async getActiveById(correlationId: string, id: string): Promise<ProcessStateV1> {
        let items = this._items.filter((x) => {
            return x.id == id
                && (x.status != ProcessStatusV1.Aborted && x.status != ProcessStatusV1.Completed);
        });
        let item = items.length > 0 ? items[0] : null;

        if (item != null)
            this._logger.trace(correlationId, "Retrieved item %s", id);
        else
            this._logger.trace(correlationId, "Cannot find item by %s", id);

        return item;
    
    }

    public async getActiveByKey(correlationId: string, processType: string, processKey: string): Promise<ProcessStateV1> {
        let items = this._items.filter((x) => {
            return x.type == processType && x.key == processKey
                && (x.status != ProcessStatusV1.Aborted && x.status != ProcessStatusV1.Completed);
        });
        let item = items.length > 0 ? items[0] : null;

        if (item != null)
            this._logger.trace(correlationId, "Retrieved item %s and %s", processType, processKey);
        else
            this._logger.trace(correlationId, "Cannot find item by %s and %s", processType, processKey);

        return item;
    }

    public async getActiveByRequestId(correlationId: string, requestId: string): Promise<ProcessStateV1> {
        let items = this._items.filter((x) => {
            return x.request_id == requestId
                && (x.status != ProcessStatusV1.Aborted && x.status != ProcessStatusV1.Completed);
        });
        let item = items.length > 0 ? items[0] : null;

        if (item != null)
            this._logger.trace(correlationId, "Retrieved item %s", requestId);
        else
            this._logger.trace(correlationId, "Cannot find item by %s", requestId);

        return item;    
    }
            
    public async truncate(correlationId: string, timeout: number): Promise<void> {
        let filterFunc = (item: ProcessStateV1): boolean => {
            return item.status == ProcessStatusV1.Completed
                || item.status == ProcessStatusV1.Aborted;
        }
        await super.deleteByFilter(correlationId, filterFunc);
    }
}
