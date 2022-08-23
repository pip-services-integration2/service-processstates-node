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
exports.CompositeProcessStatesPersistence = void 0;
const version1_1 = require("../data/version1");
class CompositeProcessStatesPersistence {
    constructor(activePersistence, allPersistence) {
        this._opened = false;
        this._activePersistence = activePersistence;
        this._allPersistence = allPersistence;
    }
    isOpen() {
        return this._opened;
    }
    open(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._activePersistence.open(correlationId);
            try {
                yield this._allPersistence.open(correlationId);
            }
            catch (err) {
                yield this._activePersistence.close(correlationId);
                throw err;
            }
            this._opened = true;
        });
    }
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._activePersistence.close(correlationId);
                yield this._allPersistence.close(correlationId);
                this._opened = false;
            }
            catch (err) {
                this._allPersistence.close(correlationId);
                throw err;
            }
        });
    }
    configure(config) {
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
    setReferences(references) {
        if (typeof this._allPersistence['setReferences'] === 'function')
            this._allPersistence['setReferences'](references);
        if (this._activePersistence['setReferences'] === 'function')
            this._activePersistence['setReferences'](references);
    }
    clear(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                this._activePersistence['clear'](correlationId),
                this._allPersistence['clear'](correlationId)
            ]);
        });
    }
    toStringArray(value) {
        if (value == null)
            return null;
        let items = value.split(',');
        return items.length > 0 ? items : null;
    }
    isActiveQuery(filter) {
        if (filter == null)
            return false;
        let recoverd = filter.getAsNullableBoolean('recoverd');
        let expired = filter.getAsNullableBoolean('expired');
        if (recoverd || expired)
            return true;
        let status = filter.getAsNullableString('status');
        if (status != null) {
            return status != version1_1.ProcessStatusV1.Completed
                && status != version1_1.ProcessStatusV1.Aborted;
        }
        let statuses = this.toStringArray(filter.getAsNullableString('statuses'));
        if (statuses != null) {
            return statuses.indexOf(version1_1.ProcessStatusV1.Completed) < 0
                && statuses.indexOf(version1_1.ProcessStatusV1.Aborted) < 0;
        }
        return false;
    }
    getPageByFilter(correlationId, filter, paging) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isActiveQuery(filter))
                return yield this._activePersistence.getPageByFilter(correlationId, filter, paging);
            else
                return yield this._allPersistence.getPageByFilter(correlationId, filter, paging);
        });
    }
    getOneById(correlationId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._allPersistence.getOneById(correlationId, id);
        });
    }
    getListByIds(correlationId, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._allPersistence.getListByIds(correlationId, ids);
        });
    }
    getActiveById(correlationId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._activePersistence.getActiveById(correlationId, id);
        });
    }
    getActiveByKey(correlationId, processType, processKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._activePersistence.getActiveByKey(correlationId, processType, processKey);
        });
    }
    getActiveByRequestId(correlationId, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._activePersistence.getActiveByRequestId(correlationId, requestId);
        });
    }
    create(correlationId, item) {
        return __awaiter(this, void 0, void 0, function* () {
            let activeItem;
            let resultItem;
            if (item.status == version1_1.ProcessStatusV1.Starting
                || item.status == version1_1.ProcessStatusV1.Running
                || item.status == version1_1.ProcessStatusV1.Suspended
                || item.status == version1_1.ProcessStatusV1.Failed) {
                activeItem = yield this._activePersistence.create(correlationId, item);
            }
            resultItem = yield this._allPersistence.create(correlationId, item);
            if (activeItem != null && resultItem == null) {
                try {
                    yield this._activePersistence.deleteById(correlationId, activeItem.id);
                }
                catch (err) {
                    // Do nothing...
                }
            }
            return resultItem;
        });
    }
    update(correlationId, item) {
        return __awaiter(this, void 0, void 0, function* () {
            let resultItem;
            let tasks = [];
            if (item.status == version1_1.ProcessStatusV1.Starting
                || item.status == version1_1.ProcessStatusV1.Running
                || item.status == version1_1.ProcessStatusV1.Suspended
                || item.status == version1_1.ProcessStatusV1.Failed) {
                tasks.push(this._activePersistence.update(correlationId, item));
            }
            else {
                tasks.push(this._activePersistence.deleteById(correlationId, item.id));
            }
            tasks.push(this._allPersistence.update(correlationId, item));
            let res = yield Promise.all(tasks);
            resultItem = res[res.length - 1];
            return resultItem;
        });
    }
    deleteById(correlationId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._activePersistence.deleteById(correlationId, id);
            let resultItem = yield this._allPersistence.deleteById(correlationId, id);
            return resultItem;
        });
    }
    deleteByIds(correlationId, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._activePersistence.deleteByIds(correlationId, ids);
            yield this._allPersistence.deleteByIds(correlationId, ids);
        });
    }
    truncate(correlationId, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._allPersistence.truncate(correlationId, timeout);
        });
    }
}
exports.CompositeProcessStatesPersistence = CompositeProcessStatesPersistence;
//# sourceMappingURL=CompositeProcessStatesPersistence.js.map