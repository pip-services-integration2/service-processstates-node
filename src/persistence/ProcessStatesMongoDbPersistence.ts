import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { DataPage } from 'pip-services3-commons-nodex';
import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-nodex';

import { ProcessStateV1 } from '../data/version1/ProcessStateV1';
import { ProcessStatusV1 } from '../data/version1/ProcessStatusV1';
import { IProcessStatesPersistence } from './IProcessStatesPersistence';

export class ProcessStatesMongoDbPersistence
    extends IdentifiableMongoDbPersistence<ProcessStateV1, string>
    implements IProcessStatesPersistence {

    public constructor(name?: string) {
        super(name || 'processes');
        super.ensureIndex({ start_time: -1 });
    }

    private toStringArray(value: string): string[] {
        if (value == null) return null;
        let items = value.split(',');
        return items.length > 0 ? items : null;
    }

    private composeFilter(filter: any) {
        filter = filter || new FilterParams();

        let criteria = [];

        let id = filter.getAsNullableString('id');
        if (id != null)
            criteria.push({ _id: id });

        let type = filter.getAsNullableString('type');
        if (type != null)
            criteria.push({ type: type });

        let status = filter.getAsNullableString('status');
        if (status != null)
            criteria.push({ status: status });

        let statuses = this.toStringArray(filter.getAsNullableString('statuses'));
        if (statuses != null)
            criteria.push({ status: { $in: statuses } });

        let key = filter.getAsNullableString('key');
        if (key != null)
            criteria.push({ key: key });

        let recovered = filter.getAsNullableBoolean('recovered');
        if (recovered == true)
            criteria.push({ recovery_time: { $lt: new Date() } });

        let expired = filter.getAsNullableBoolean('expired');
        if (expired == true)
            criteria.push({ expiration_time: { $lt: new Date() } });

        let fromTime = filter.getAsNullableDateTime('from_time');
        if (fromTime != null)
            criteria.push({ start_time: { $gte: fromTime } });

        let toTime = filter.getAsNullableDateTime('to_time');
        if (fromTime != null)
            criteria.push({ start_time: { $lte: toTime } });

        let search = filter.getAsNullableString('search');
        if (search != null) {
            let searchRegex = new RegExp(search, "i");
            let searchCriteria = [];
            searchCriteria.push({ id: { $regex: searchRegex } });
            searchCriteria.push({ type: { $regex: searchRegex } });
            searchCriteria.push({ key: { $regex: searchRegex } });
            searchCriteria.push({ status: { $regex: searchRegex } });
            criteria.push({ $or: searchCriteria });
        }

        return criteria.length > 0 ? { $and: criteria } : null;
    }

    public async getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<ProcessStateV1>> {
        return await super.getPageByFilter(correlationId, this.composeFilter(filter), paging, '-start_time', null);
    }

    public async getActiveById(correlationId: string, id: string): Promise<ProcessStateV1> {
        let filter = {
            $and: [
                { _id: id },
                { status: { $ne: ProcessStatusV1.Aborted } },
                { status: { $ne: ProcessStatusV1.Completed } }
            ]
        };

        let item = await this._collection.findOne(filter);

        if (item == null)
            this._logger.trace(correlationId, "Nothing found from %s with id = %s", this._collectionName, id);
        else
            this._logger.trace(correlationId, "Retrieved from %s with id = %s", this._collectionName, id);

        return this.convertToPublic(item);
    }

    public async getActiveByKey(correlationId: string, processType: string, processKey: string): Promise<ProcessStateV1> {
        let filter = {
            $and: [
                { type: processType },
                { key: processKey },
                { status: { $ne: ProcessStatusV1.Aborted } },
                { status: { $ne: ProcessStatusV1.Completed } }
            ]
        };

        let item = await this._collection.findOne(filter);
        
        if (item == null)
            this._logger.trace(correlationId, "Nothing found from %s with type = %s and key = %s", this._collectionName, processType, processKey);
        else
            this._logger.trace(correlationId, "Retrieved from %s with type = %s and key = %s", this._collectionName, processType, processKey);

            
        return this.convertToPublic(item);
    }

    public async getActiveByRequestId(correlationId: string, requestId: string): Promise<ProcessStateV1> {
        let filter = {
            $and: [
                { request_id: requestId },
                { status: { $ne: ProcessStatusV1.Aborted } },
                { status: { $ne: ProcessStatusV1.Completed } }
            ]
        };

        let item = await this._collection.findOne(filter);
            
        if (item == null)
            this._logger.trace(correlationId, "Nothing found from %s with request_id = %s", this._collectionName, requestId);
        else
            this._logger.trace(correlationId, "Retrieved from %s with request_id = %s", this._collectionName, requestId);

        return this.convertToPublic(item);
    }

    public async truncate(correlationId: string, timeout: number): Promise<void> {
        let filter = {
            $or: [
                { status: ProcessStatusV1.Aborted },
                { status: ProcessStatusV1.Completed }
            ]
        };
        await super.deleteByFilter(correlationId, filter);
    }
}
