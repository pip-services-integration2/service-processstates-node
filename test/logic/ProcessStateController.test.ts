const assert = require('chai').assert;

import { ConfigParams } from "pip-services3-commons-nodex";
import { Descriptor } from "pip-services3-commons-nodex";
import { References } from "pip-services3-commons-nodex";
import { FilterParams } from "pip-services3-commons-nodex";
import { PagingParams } from "pip-services3-commons-nodex";

import { ProcessStatesMemoryPersistence } from "../../src/persistence/ProcessStatesMemoryPersistence";
import { ProcessStatesController } from "../../src/logic/ProcessStatesController";
import { ProcessStateV1, ProcessStatusV1, MessageV1, TaskStatusV1 } from "../../src/data/version1";
import { TaskStateV1 } from "../../src/data/version1/TaskStateV1";

let MESSAGE1: MessageV1 = {
    correlation_id: "test_processes1",
    message_id: "msg_1",
    message_type: "Order.Msg",
    sent_time: new Date(Date.now() - 2 * 3600),
    message: "Sync orders"
}

let MESSAGE2: MessageV1 = {
    correlation_id: "test_processes2",
    message_id: "msg_2",
    message_type: "Order.Msg",
    sent_time: new Date(Date.now() - 3600),
    message: "Copy orders"
}

let MESSAGE3: MessageV1 = {
    correlation_id: "test_processes3",
    message_id: "msg_3",
    message_type: "Order.Msg",
    sent_time: new Date(),
    message: "Sync orders"
}

suite('ProcessStatesController', () => {
    let _persistence: ProcessStatesMemoryPersistence;
    let _controller: ProcessStatesController;

    setup(async () => {
        _persistence = new ProcessStatesMemoryPersistence();
        _controller = new ProcessStatesController();
        _persistence.configure(new ConfigParams());
        let references = References.fromTuples(
            new Descriptor("service-processstates", "persistence", "mock", "default", "1.0"), _persistence
        );
        _controller.setReferences(references);
        await _persistence.open(null);
    });

    teardown(async () => {
        await _persistence.close(null);
    });

    test('CRUD Operations', async () => {

        let process1, process2: ProcessStateV1;
        
        // Create process one
        let process = await _controller.startProcess(null, "Process.Type1", null, "Task.TypeX", "queue_x", MESSAGE1, 5 * 3600);

        assert.equal(process.request_id, MESSAGE1.correlation_id);
        assert.equal(process.type, "Process.Type1");
        assert.equal(process.status, ProcessStatusV1.Starting);
        assert.isNotNull(process.start_time);
        assert.isNotNull(process.last_action_time);
        assert.isNotNull(process.expiration_time);
        assert.isNotNull(process.tasks);
        assert.equal(process.tasks.length, 1);
        assert.isNotNull(process.data);
        process1 = process;

        // Create process two
        process = await _controller.startProcess(null, "Process.Type1", null, "Task.TypeX", "queue_x", MESSAGE2, 2 * 3600);

        assert.equal(process.request_id, MESSAGE2.correlation_id);
        assert.equal(process.type, "Process.Type1");
        assert.equal(process.status, ProcessStatusV1.Starting);
        assert.isNotNull(process.start_time);
        assert.isNotNull(process.last_action_time);
        assert.isNotNull(process.expiration_time);
        assert.isNotNull(process.tasks);
        assert.equal(process.tasks.length, 1);
        assert.isNotNull(process.data);
        process2 = process;

        // Create process three
        process = await _controller.startProcess(null, "Process.Type1", null, "Task.TypeX", "queue_x", MESSAGE3, 3 * 3600);

        assert.equal(process.request_id, MESSAGE3.correlation_id);
        assert.equal(process.type, "Process.Type1");
        assert.equal(process.status, ProcessStatusV1.Starting);
        assert.isNotNull(process.start_time);
        assert.isNotNull(process.last_action_time);
        assert.isNotNull(process.expiration_time);
        assert.isNotNull(process.tasks);
        assert.equal(process.tasks.length, 1);
        assert.isNotNull(process.data);

        // Get all processes
        let page = await _controller.getProcesses(null, new FilterParams(), new PagingParams);

        assert.isNotNull(page);
        assert.isObject(page);
        assert.equal(page.data.length, 3);

        // Update process
        process1.comment = "Update comment";

        process = await _controller.updateProcess(null, process1);

        assert.equal(process.comment, "Update comment");
        assert.equal(process.id, process1.id);

        // Get process
        process = await _controller.getProcessById(null, process1.id);

        assert.equal(process.id, process1.id);

        // Delete process
        process = await _controller.deleteProcessById(null, process2.id);
        assert.equal(process2.id, process.id);

        // Get all processes
        page = await _controller.getProcesses(null, new FilterParams(), new PagingParams);

        assert.isNotNull(page);
        assert.isObject(page);
        assert.equal(page.data.length, 2);

        // Try get deleted processes
        process = await _controller.getProcessById(null, process2.id);

        assert.isNull(process);
    });

    test('Get Process by null Id', async () => {
        let err = null;
        
        try {
            await _controller.getProcessById(null, null);
        } catch (ex) {
            err = ex;
        }

        assert.isNotNull(err);
    });

    // It Should Continue Process
    test('Continue Process', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        await _persistence.create(null, process);
        await _controller.continueProcess(null, process);
    });

    // It Should Return Error If Process Not Found 
    test('Try Continue Process with not exist id', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id_not_exists";

        let err = null;
        try {
            await _controller.continueProcess(null, process);
        } catch(ex) {
            err = ex;
        }

        assert.isNotNull(err);
    });
    //It Should Return Error If Process Dont Have Id
    test('Try Continue Process with null id', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        let err = null;
        
        try {
            await _controller.continueProcess(null, process);
        } catch (ex) {
            err = ex;
        }

        assert.isNotNull(err);
    });

    //It Should Abort Process()
    test('Abort Process', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        let comment = "comment";

        process = await _persistence.create(null, process);  
        await _controller.abortProcess(null, process, comment);

        let processResult = await _persistence.getOneById(null, process.id);

        assert.equal(process.id, processResult.id);
        assert.equal(ProcessStatusV1.Aborted, processResult.status);
        assert.equal(comment, processResult.comment);
    });


    test("Continuie With Recovery Process", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        let messageEnvelop: MessageV1 = new MessageV1();
        messageEnvelop.correlation_id = "corrlation id";
        messageEnvelop.message_type = "message type"
        messageEnvelop.message = "";
        await _persistence.create(null, process);
        await _controller.continueAndRecoverProcess(null, process, "queue name", messageEnvelop, 0);

        let processResult = await _persistence.getOneById(null, process.id);

        assert.equal(ProcessStatusV1.Running, processResult.status);
        assert.equal(process.id, processResult.id);
        assert.equal(messageEnvelop, processResult.recovery_message);
        assert.equal("queue name", processResult.recovery_queue_name);
    });

    test("Complete Process", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;

        process = await _persistence.create(null, process);

        await _controller.completeProcess(null, process);

        let processResult = await _persistence.getOneById(null, process.id);

        assert.equal(process.id, processResult.id);
        assert.equal(ProcessStatusV1.Completed, processResult.status);
    });


    test("Request For Response Process", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        process = await _persistence.create(null, process);
        
        let processResult = await _controller.requestProcessForResponse(null, process, "request", "queue", new MessageV1());
        
        assert.equal(process.id, processResult.id);
        assert.equal("queue", processResult.recovery_queue_name);
        assert.equal("request", processResult.request);
        assert.equal(ProcessStatusV1.Suspended, processResult.status);
    });

    test("Rollback Process With Status Running", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;

        process = await _persistence.create(null, process);

        await _controller.rollbackProcess(null, process);

        let processResult = await _persistence.getOneById(null, process.id);
        assert.equal(process.id, processResult.id);
        assert.equal(ProcessStatusV1.Running, processResult.status);
    });


    test("Rollback Process With State Starting", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Starting;

        process = await _persistence.create(null, process);

        await _controller.rollbackProcess(null, process);
        let processResult = await _persistence.getOneById(null, process.id);

        assert.isNull(processResult);
    });


    test("Fail Process", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        let comment = "comment";

        process = await _persistence.create(null, process);

        await _controller.failProcess(null, process, comment);

        let processResult = await _persistence.getOneById(null, process.id);

        assert.equal(ProcessStatusV1.Failed, processResult.status);

        process = await _persistence.create(null, process);

        await _controller.failProcess(null, process, comment);

    });

    test("Fail With Recovery Process", async () => {

        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        let error = "error Message";
        let messageEnvelop: MessageV1 = new MessageV1();
        messageEnvelop.correlation_id = "corrlation id";
        messageEnvelop.message_type = "message type"
        messageEnvelop.message = "";

        process = await _persistence.create(null, process);
        await _controller.failAndRecoverProcess(null, process, error, "queue name", messageEnvelop, 0);

        let processResult = await _persistence.getOneById(null, process.id);

        assert.equal(process.id, processResult.id);
        assert.equal(messageEnvelop, processResult.recovery_message);
        assert.equal("queue name", processResult.recovery_queue_name);
    });


    test("Continue For Fail Process", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        let error = "error Message";
        let messageEnvelop: MessageV1 = new MessageV1();
        messageEnvelop.correlation_id = "corrlation id";
        messageEnvelop.message_type = "message type"
        messageEnvelop.message = "";

        process = await _persistence.create(null, process);

        process.recovery_message = messageEnvelop;
        await _controller.failAndContinueProcess(null, process, error);

        let processResult = await _persistence.getOneById(null, process.id);

        assert.equal(process.id, processResult.id);
        assert.equal(ProcessStatusV1.Running, processResult.status);
        assert.isNull(processResult.recovery_message);
        assert.isNull(processResult.recovery_queue_name);
    });


    test("Repeat Recovery Process", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        
        process = await _persistence.create(null, process);
        await _controller.repeatProcessRecovery(null, process);

        let processResult = await _persistence.getOneById(null, process.id);

        assert.equal(1, processResult.recovery_attempts);
    });


    test("Return Error If Process State Dont Equal Starting", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        process.key = "key";
        process.type = "type";

        process = await _persistence.create(null, process);
        

        let err = null;
        try {
            await _controller.startProcess(null, "type", "key", "type", null, null, null);
        } catch(ex) {
            err = ex;
        }
        
        assert.isNotNull(err);
    });


    test("Start", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Starting;

        process = await _persistence.create(null, process);
        let processResult = await _controller.startProcess(null, "type", "key", "type", null, null, null);
        
        assert.equal(ProcessStatusV1.Starting, processResult.status);
    });

    test("Start Or Activate Process", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Starting;

        process = await _persistence.create(null, process);
        let processResult = await _controller.activateOrStartProcess(null, "type", "key", "type", null, null, 0);

        assert.equal(ProcessStatusV1.Starting, processResult.status);
    });


    test("Return Error If Resume Started Without Process", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Starting;

        let err = null;

        try {
            await _controller.resumeProcess(null, process, "comment");
        } catch(ex) {
            err = ex;
        }

        assert.isNotNull(err);
    });

    test("Return Error If Resume Started Without Process Id", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Starting;

        let err = null;

        try {
            await _controller.resumeProcess(null, process, "comment");
        } catch(ex) {
            err = ex;
        }

        assert.isNotNull(err);
    });


    test("Return Error If Process Type Null", async () => {
        let err = null;

        try {
            await _controller.activateOrStartProcess(null, null, "key", "type", null, null, 0);
        } catch(ex) {
            err = ex;
        }

        assert.isNotNull(err);
    });

    //TODO: Need check this test!
    test("Return Error If Process Key Null", async () => {
        let err = null;

        try {
            await _controller.activateOrStartProcess(null, "type", null, "type", null, new MessageV1(), 0);
        } catch (ex) {
            err = ex;
        }

        assert.isNotNull(err);
    });


    test("Resume Without Completed Tasks Process", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Suspended;
        process.tasks = new Array<TaskStateV1>();

        process = await _persistence.create(null, process);

        let processResult = await _controller.resumeProcess(null, process, "comment");
        
        assert.equal(ProcessStatusV1.Starting, processResult.status);
        assert.equal("comment", processResult.comment);
    });


    // It_Should_()
    test("Resume With Completed Tasks Process", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Suspended;
        process.tasks = new Array<TaskStateV1>();
        let task: TaskStateV1 = new TaskStateV1();
        task.status = TaskStatusV1.Completed;
        task.queue_name = "activity queue name";
        process.tasks.push(task);

        process = await _persistence.create(null, process);

        let processResult = await _controller.resumeProcess(null, process, "comment");

        assert.equal(ProcessStatusV1.Running, processResult.status);
        assert.equal("comment", processResult.comment);
    });


    test("Clear Recovery Message In Process", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        process.recovery_message = new MessageV1();
        process.recovery_time = new Date();
        process.recovery_queue_name = "queue";

        process = await _persistence.create(null, process);
        await _controller.clearProcessRecovery(null, process);

        let processResult = await _persistence.getOneById(null, process.id);

        assert.equal(process.id, processResult.id);
        assert.isNull(processResult.recovery_queue_name);
        assert.isNull(processResult.recovery_time);
        assert.isNull(processResult.recovery_message);
    });

    test("Update Process", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        process.recovery_message = new MessageV1();
        process.recovery_time = new Date();
        process.recovery_queue_name = "queue";

        await _persistence.create(null, process);

        process.recovery_queue_name = "updated queue";
        let resultProcess = await _controller.updateProcess(null, process);
        
        assert.isNotNull(resultProcess);
        assert.equal(resultProcess.id, process.id);
        assert.equal(resultProcess.recovery_queue_name, process.recovery_queue_name);
    });

    test("Delete Process", async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        process.recovery_message = new MessageV1();
        process.recovery_time = new Date();
        process.recovery_queue_name = "queue";

        await _persistence.create(null, process);
        await _controller.deleteProcessById(null, process.id);
        let processResult = await _persistence.getOneById(null, process.id)

        assert.isNull(processResult);
    });

    // It_Should_()
    test("Truncate Process", async () => {

        let process1: ProcessStateV1 = new ProcessStateV1();
        let process2: ProcessStateV1 = new ProcessStateV1();
        let process3: ProcessStateV1 = new ProcessStateV1();
        
        process1.id = "id1";
        process1.lock_token = "token";
        process1.locked_until_time = new Date();
        process1.status = ProcessStatusV1.Completed;
        process1.recovery_message = new MessageV1();
        process1.recovery_time = new Date();
        process1.recovery_queue_name = "queue";

        process2.id = "id2";
        process2.lock_token = "token";
        process2.locked_until_time = new Date();
        process2.status = ProcessStatusV1.Aborted;
        process2.recovery_message = new MessageV1();
        process2.recovery_time = new Date();
        process2.recovery_queue_name = "queue";

        process3.id = "id3";
        process3.lock_token = "token";
        process3.locked_until_time = new Date();
        process3.status = ProcessStatusV1.Running;
        process3.recovery_message = new MessageV1();
        process3.recovery_time = new Date();
        process3.recovery_queue_name = "queue";

        await _persistence.create(null, process1);
        await _persistence.create(null, process2);
        await _persistence.create(null, process3);
        await _controller.truncate(null, 0);

        let processResult = await _persistence.getOneById(null, process1.id);
        assert.isNull(processResult);

        processResult = await _persistence.getOneById(null, process2.id);
        assert.isNull(processResult);

        processResult = await _persistence.getOneById(null, process3.id);
        assert.equal(process3.id, processResult.id);
    });
})
