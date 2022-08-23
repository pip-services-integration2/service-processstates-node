const assert = require('chai').assert;

import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { ProcessStateV1 } from '../../src/data/version1/ProcessStateV1';

import { IProcessStatesPersistence } from '../../src/persistence/IProcessStatesPersistence';
import { TaskStateV1, ProcessStatusV1 } from '../../src/data/version1';


let STATE1: ProcessStateV1 = {
    id: "id_1",
    type: "Copy orders",
    request_id: "req_123",
    key: "Orders.Sync",
    status: ProcessStatusV1.Running,
    start_time: new Date(),
    // end_time: null,
    last_action_time: new Date(Date.now() + 600),
    expiration_time: new Date(Date.now() + 3600),
    request: "",
    comment: "State 1",
    recovery_time: null,
    recovery_queue_name: "recover_queue",
    recovery_message: null,
    recovery_timeout: 3600,
    recovery_attempts: 0,
    lock_token: "",
    locked_until_time: null,
    tasks: Array<TaskStateV1>(),
    data: null
};

let STATE2: ProcessStateV1 = {
    id: "id_2",
    type: "Copy orders",
    request_id: "req_231",
    key: "Orders.Sync",
    status: ProcessStatusV1.Running,
    start_time: new Date(),
    // end_time: null,
    last_action_time: new Date(Date.now() + 1600),
    expiration_time: new Date(Date.now() + 2 * 3600),
    request: "",
    comment: "State 2",
    recovery_time: null,
    recovery_queue_name: "recover_queue",
    recovery_message: null,
    recovery_timeout: 3600,
    recovery_attempts: 0,
    lock_token: "",
    locked_until_time: null,
    tasks: Array<TaskStateV1>(),
    data: null
};

let STATE3: ProcessStateV1 = {
    id: "id_3",
    type: "Copy invoces",
    request_id: "req_321",
    key: "Copy.Invoces",
    status: ProcessStatusV1.Suspended,
    start_time: new Date(),
    // end_time: null,
    last_action_time: new Date(Date.now() + 2600),
    expiration_time: new Date(Date.now() + 3 * 3600),
    request: "",
    comment: "State 3",
    recovery_time: new Date(),
    recovery_queue_name: "recover_queue",
    recovery_message: null,
    recovery_timeout: 3600,
    recovery_attempts: 0,
    lock_token: "",
    locked_until_time: null,
    tasks: Array<TaskStateV1>(),
    data: null
};

let STATE4: ProcessStateV1 = {
    id: "id_4",
    type: "Copy invoces",
    request_id: "req_321",
    key: "Copy.Invoces",
    status: ProcessStatusV1.Completed,
    start_time: new Date(),
    end_time: new Date(Date.now() + 3600),
    last_action_time: null,
    expiration_time: new Date(Date.now() + 3 * 3600),
    request: "",
    comment: "State 3",
    recovery_time: null,
    recovery_queue_name: "recover_queue",
    recovery_message: null,
    recovery_timeout: 3600,
    recovery_attempts: 0,
    lock_token: "",
    locked_until_time: null,
    tasks: Array<TaskStateV1>(),
    data: null
};

export class ProcessStatesPersistenceFixture {
    private _persistence: IProcessStatesPersistence;

    constructor(persistence) {
        assert.isNotNull(persistence);
        this._persistence = persistence;
    }

    private async testCreateProcessStates() {
        // Create one process state
        let processState = await this._persistence.create(null, STATE1);

        assert.isObject(processState);
        assert.equal(processState.id, STATE1.id);
        assert.equal(processState.type, STATE1.type);
        assert.equal(processState.request_id, STATE1.request_id);
        assert.equal(processState.start_time, STATE1.start_time);
        assert.equal(processState.last_action_time, STATE1.last_action_time);
        assert.equal(processState.expiration_time, STATE1.expiration_time);
        assert.equal(processState.request, STATE1.request);
        assert.equal(processState.recovery_time, STATE1.recovery_time);
        assert.equal(processState.recovery_queue_name, STATE1.recovery_queue_name);
        assert.equal(processState.recovery_message, STATE1.recovery_message);
        assert.equal(processState.recovery_timeout, STATE1.recovery_timeout);
        assert.equal(processState.recovery_attempts, STATE1.recovery_attempts);
        assert.equal(processState.lock_token, STATE1.lock_token);
        assert.equal(processState.locked_until_time, STATE1.locked_until_time);
        assert.equal(processState.tasks, STATE1.tasks);
        assert.equal(processState.data, STATE1.data);

        // Create another process state
        processState = await this._persistence.create(null, STATE2);

        assert.isObject(processState);
        assert.equal(processState.id, STATE2.id);
        assert.equal(processState.type, STATE2.type);
        assert.equal(processState.request_id, STATE2.request_id);
        assert.equal(processState.start_time, STATE2.start_time);
        assert.equal(processState.last_action_time, STATE2.last_action_time);
        assert.equal(processState.expiration_time, STATE2.expiration_time);
        assert.equal(processState.request, STATE2.request);
        assert.equal(processState.recovery_time, STATE2.recovery_time);
        assert.equal(processState.recovery_queue_name, STATE2.recovery_queue_name);
        assert.equal(processState.recovery_message, STATE2.recovery_message);
        assert.equal(processState.recovery_timeout, STATE2.recovery_timeout);
        assert.equal(processState.recovery_attempts, STATE2.recovery_attempts);
        assert.equal(processState.lock_token, STATE2.lock_token);
        assert.equal(processState.locked_until_time, STATE2.locked_until_time);
        assert.equal(processState.tasks, STATE2.tasks);
        assert.equal(processState.data, STATE2.data);
        
        // Create yet another process state
        processState = await this._persistence.create(null, STATE3);

        assert.isObject(processState);
        assert.equal(processState.id, STATE3.id);
        assert.equal(processState.type, STATE3.type);
        assert.equal(processState.request_id, STATE3.request_id);
        assert.equal(processState.start_time, STATE3.start_time);
        assert.equal(processState.last_action_time, STATE3.last_action_time);
        assert.equal(processState.expiration_time, STATE3.expiration_time);
        assert.equal(processState.request, STATE3.request);
        assert.equal(processState.recovery_time, STATE3.recovery_time);
        assert.equal(processState.recovery_queue_name, STATE3.recovery_queue_name);
        assert.equal(processState.recovery_message, STATE3.recovery_message);
        assert.equal(processState.recovery_timeout, STATE3.recovery_timeout);
        assert.equal(processState.recovery_attempts, STATE3.recovery_attempts);
        assert.equal(processState.lock_token, STATE3.lock_token);
        assert.equal(processState.locked_until_time, STATE3.locked_until_time);
        assert.equal(processState.tasks, STATE3.tasks);
        assert.equal(processState.data, STATE3.data);
    }

    public async testCrudOperations() {
        let processState1: ProcessStateV1;
        
        // Create items
        await this.testCreateProcessStates();
        
        // Get all process states
        let page = await this._persistence.getPageByFilter(null, new FilterParams(), new PagingParams());

        assert.isObject(page);
        assert.lengthOf(page.data, 3);

        processState1 = page.data[0];

        // Update the process state
        processState1.comment = 'Updated State 1';

        let processState = await this._persistence.update(
            null,
            processState1
        );

        assert.isObject(processState);
        assert.equal(processState.comment, 'Updated State 1');
        processState1 = processState;

        // Delete process state
        await this._persistence.deleteById(null, processState1.id);

        // Try to get delete process state
        processState = await this._persistence.getOneById(null, processState1.id);
        assert.isNull(processState || null);
    }

    public async testGetWithFilter() {
        // Create process states
        await this.testCreateProcessStates();

        // Get process states filtered by process key
        let page = await this._persistence.getPageByFilter(
            null,
            FilterParams.fromValue({
                key: 'Orders.Sync'
            }),
            new PagingParams()
        );

        assert.isObject(page);
        assert.lengthOf(page.data, 2);

        // Get process states by status
        page = await this._persistence.getPageByFilter(
            null,
            FilterParams.fromValue({
                status: ProcessStatusV1.Running
            }),
            new PagingParams()
        );

        assert.isObject(page);
        assert.lengthOf(page.data, 2);

        // Get process states by recovered
        page = await this._persistence.getPageByFilter(
            null,
            FilterParams.fromValue({
                recovered: true
            }),
            new PagingParams()
        );

        assert.isObject(page);
        assert.lengthOf(page.data, 1);
        
        // Get process states by statuses
        page = await this._persistence.getPageByFilter(
            null,
            FilterParams.fromValue({
                statuses: [ProcessStatusV1.Running, ProcessStatusV1.Suspended]
            }),
            new PagingParams()
        );

        assert.isObject(page);
        assert.lengthOf(page.data, 3);
    }

    public async testGetActiveProcess() {
        // Create process states
        await this.testCreateProcessStates();

        // Get active process states by process id
        let item = await this._persistence.getActiveById(null, STATE3.id);

        assert.isObject(item);
        assert.equal(STATE3.id, item.id);

        // Get active process states by key
        item = await this._persistence.getActiveByKey(null, STATE1.type, STATE1.key);

        assert.isObject(item);
        assert.equal(STATE1.id, item.id);

        // Get active process states by requestId
        item = await this._persistence.getActiveByRequestId(null, STATE2.request_id);

        assert.isObject(item);
        assert.equal(STATE2.id, item.id);
    }

    public async testTruncateProcesses() {
        // Create process states
        await this.testCreateProcessStates();

        // Create process states
        let processState = await this._persistence.create(null, STATE4);

        assert.isObject(processState);
        assert.equal(processState.id, STATE4.id);
        assert.equal(processState.type, STATE4.type);
        assert.equal(processState.request_id, STATE4.request_id);
        assert.equal(processState.start_time, STATE4.start_time);
        assert.equal(processState.last_action_time, STATE4.last_action_time);
        assert.equal(processState.expiration_time, STATE4.expiration_time);
        assert.equal(processState.request, STATE4.request);
        assert.equal(processState.recovery_time, STATE4.recovery_time);
        assert.equal(processState.recovery_queue_name, STATE4.recovery_queue_name);
        assert.equal(processState.recovery_message, STATE4.recovery_message);
        assert.equal(processState.recovery_timeout, STATE4.recovery_timeout);
        assert.equal(processState.recovery_attempts, STATE4.recovery_attempts);
        assert.equal(processState.lock_token, STATE4.lock_token);
        assert.equal(processState.locked_until_time, STATE4.locked_until_time);
        assert.equal(processState.tasks, STATE4.tasks);
        assert.equal(processState.data, STATE4.data);

        // Get all process states
        let page = await this._persistence.getPageByFilter(
            null,
            new FilterParams(),
            new PagingParams()
        );

        assert.isObject(page);
        assert.lengthOf(page.data, 4);

        await this._persistence.truncate(null, 0);

        // Get all process states
        page = await this._persistence.getPageByFilter(
            null,
            new FilterParams(),
            new PagingParams()
        );

        assert.isObject(page);
        assert.lengthOf(page.data, 3);
    }
}
