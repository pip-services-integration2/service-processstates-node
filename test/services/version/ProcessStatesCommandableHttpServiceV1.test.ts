const restify = require('restify');
const assert = require('chai').assert;

import { ConfigParams, FilterParams, PagingParams } from 'pip-services3-commons-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';

import { ProcessStateV1 } from '../../../src/data/version1/ProcessStateV1';
import { ProcessStatesMemoryPersistence } from '../../../src/persistence/ProcessStatesMemoryPersistence';
import { ProcessStatesController } from '../../../src/logic/ProcessStatesController';
import { ProcessStatesCommandableHttpServiceV1 } from '../../../src/services/version1/ProcessStatesCommandableHttpServiceV1';
import { MessageV1, ProcessStatusV1, TaskStateV1 } from '../../../src/data/version1';

let httpConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);


const PROCESS1: ProcessStateV1 = <ProcessStateV1>{
    id: "id1",
    lock_token: "proc.token",
    key: "proc.key",
    type: "proc.type.c",
    locked_until_time: new Date(),
    last_action_time: new Date(),
    status: ProcessStatusV1.Starting,
    request_id: "req.id1"
}

const PROCESS2: ProcessStateV1 = <ProcessStateV1>{
    id: "id2",
    lock_token: "proc.token2",
    key: "proc.key",
    type: "proc.type",
    locked_until_time: new Date(),
    last_action_time: new Date(),
    recovery_time: new Date(Date.now() - 3600),
    status: ProcessStatusV1.Running,
    request_id: "req.id2"
}

const PROCESS3: ProcessStateV1 = <ProcessStateV1>{
    id: "id2",
    lock_token: "proc.token",
    key: "proc.key1",
    type: "proc.type",
    locked_until_time: new Date(),
    last_action_time: new Date(),
    status: ProcessStatusV1.Suspended,
    request_id: "req.id3"
}

suite('ProcessStatesCommandableHttpServiceV1', () => {
    let service: ProcessStatesCommandableHttpServiceV1;
    let rest: any;
    let _message: MessageV1 = new MessageV1();
    let persistence: ProcessStatesMemoryPersistence;

    suiteSetup(async () => {
        persistence = new ProcessStatesMemoryPersistence();
        let controller = new ProcessStatesController();

        service = new ProcessStatesCommandableHttpServiceV1();
        service.configure(httpConfig);

        let references: References = References.fromTuples(
            new Descriptor('service-processstates', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('service-processstates', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('service-processstates', 'service', 'commandable-http', 'default', '1.0'), service
        );
        controller.setReferences(references);
        service.setReferences(references);
        await service.open(null);
    });

    suiteTeardown(async () => {
        await service.close(null);
    });

    setup(async () => {
        let url = 'http://localhost:3000';
        rest = restify.createJsonClient({ url: url, version: '*' });
        await persistence.clear("123");
    });

    test('Rollback Process', async () => {
        // arrange
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.type = "type";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;

        process = await persistence.create(null, process);

        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/rollback_process',
                {
                    state: process
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        let processResult = await persistence.getOneById(null, process.id);

        assert.equal(process.id, processResult.id);
        assert.equal(ProcessStatusV1.Running, processResult.status);
        assert.isNull(process.lock_token);
    });

    test('Return Error If Rollback Process Dont Have Id', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();

        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/rollback_process',
                {
                    state: process
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });



    test('Test Get Processes With Filters', async () => {

        let process1, process2: ProcessStateV1;

        // Create process one
        await persistence.create(null, PROCESS1);

        // Create process two
        await persistence.create(null, PROCESS2);

        // Create process three
        await persistence.create(null, PROCESS3);

        // Get all processes
        let page = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/get_processes',
                {
                    filter: new FilterParams(),
                    paging: new PagingParams()
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.isNotNull(page);
        assert.isObject(page);
        assert.equal(page.data.length, 3);

        // Get processes by type
        page = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/get_processes',
                {
                    filter: FilterParams.fromTuples("type", "proc.type"),
                    paging: new PagingParams()
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.isNotNull(page);
        assert.isObject(page);
        assert.equal(page.data.length, 2);
        
        // Get processes by status
        page = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/get_processes',
                {
                    filter: FilterParams.fromTuples("status", ProcessStatusV1.Running),
                    paging: new PagingParams()
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.isNotNull(page);
        assert.isObject(page);
        assert.equal(page.data.length, 1);

        // Get recovered processes
        page = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/get_processes',
                {
                    filter: FilterParams.fromTuples("recovered", true),
                    paging: new PagingParams()
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.isNotNull(page);
        assert.isObject(page);
        assert.equal(page.data.length, 1);
    });

    test('Return Error If Activate Or Start Process Without Type', async () => {
        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/activate_or_start_process',
                {
                    process_type: null,
                    process_key: null,
                    task_type: null,
                    queue_name: null,
                    message: null,
                    ttl: 0
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });

    test('Return Error If Activate Process Without Type', async () => {
        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/activate_process',
                {
                    process_id: null,
                    task_type: null,
                    queue_name: null,
                    message: null
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });

    test('Return Error If Activate By Key Process Without Type', async () => {
        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/activate_process_by_key',
                {
                    process_type: null,
                    process_key: null,
                    task_type: null,
                    queue_name: null,
                    message: null
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });

    test('Return Error If Request For Response Without Process Id', async () => {
        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/request_process_for_response',
                {
                    process_type: null,
                    process_key: null,
                    task_type: null,
                    queue_name: null,
                    message: null
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });

    test('Return Error If Complete Process Without Process Id', async () => {
        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/complete_process',
                {
                    state: null
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });

    test('Return Error If Abort Process Without Process Id', async () => {
        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/abort_process',
                {
                    state: null,
                    comment: null
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });

    test('Return Error If Fail Process Without Process Id', async () => {
        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/fail_process',
                {
                    state: null,
                    err_msg: null
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });

    test('Return Error If Get By Id Process Without Process Id', async () => {
        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/get_process_by_id',
                {
                    process_id: null
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });

    test('Return Error If Start Async Process Without Process Id', async () => {
        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/start_process',
                {
                    process_type: null,
                    process_key: null,
                    task_type: null,
                    queue_name: null,
                    message: null,
                    ttl: null
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });

    test('Return Error If Reactive Process Without Process Id', async () => {
        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/resume_process',
                {
                    state: null,
                    comment: null
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });

    test('Return Error If Continue Process With Null State State', async () => {
        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/continue_process',
                {
                    state: null
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });

    test('Return Error If Clear Recovery Process With Null Process State', async () => {

        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/clear_process_recovery',
                {
                    state: null
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });

    test('Return Error If Repeat Recovery Process With Null Process State', async () => {
        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/repeat_process_recovery',
                {
                    state: null,
                    timeout: 0
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });

    test('Return Error If Fail And Continue Process With Null Process State', async () => {
        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/fail_and_continue_process',
                {
                    state: null,
                    err_msg: null
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });

    test('Return Error If Fail And Recover Process With Null Process State', async () => {

        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/fail_and_recover_process',
                {
                    state: null,
                    err_msg: null,
                    queue_name: null,
                    message: null,
                    timeout: null
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });


    // It_Should_Return_Error_If_Continue_With_Recovery_Process_With_Null_Flow()
    test('Return Error If Continue With Recovery Process With Null Process States', async () => {
        let err = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/continue_and_recovery_process',
                {
                    state: null,
                    queue_name: null,
                    message: null,
                    ttl: null
                },
                (err, req, res, result) => {
                    resolve(err);
                }
            );
        });

        assert.isNotNull(err);
    });



    // It_Should_Continue_Process()
    test('Continue Process', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Starting;
        process.type = "area.type";

        process = await persistence.create(null, process);

        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/continue_process',
                {
                    state: process
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        let processResult = await persistence.getOneById(null, process.id);

        assert.equal(process.id, processResult.id);
        assert.equal(ProcessStatusV1.Running, processResult.status);
    });

    test('Fail Process', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.type = "type";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        let comment: string = "comment";

        process = await persistence.create(null, process);

        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/fail_process',
                {
                    state: process,
                    err_msg: comment
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        let processResult = await persistence.getOneById(null, process.id);

        assert.equal(process.id, processResult.id);
        assert.equal(ProcessStatusV1.Failed, processResult.status);
    });


    test('Fail With Recovery Proces', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.type = "type";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;

        let error = "error Message";
        let messageEnvelop: MessageV1 = new MessageV1();
        messageEnvelop.correlation_id = "corrlation id";
        messageEnvelop.message_type = "message type"
        messageEnvelop.message = "";

        process = await persistence.create(null, process);

        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/fail_and_recover_process',
                {
                    state: process,
                    err_msg: error,
                    queue_name: "queue name",
                    message: messageEnvelop,
                    timeout: 0
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        let processResult = await persistence.getOneById(null, process.id);

        assert.equal(process.id, processResult.id);
        assert.equal(messageEnvelop.correlation_id, processResult.recovery_message.correlation_id);
        assert.equal("queue name", processResult.recovery_queue_name);
    });

    test('Continue For Fail Process', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.type = "type";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;

        let error = "error Message";
        let messageEnvelop: MessageV1 = new MessageV1();
        messageEnvelop.correlation_id = "corrlation id";
        messageEnvelop.message_type = "message type"
        messageEnvelop.message = "";

        process = await persistence.create(null, process);

        process.recovery_message = messageEnvelop;
        
        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/fail_and_continue_process',
                {
                    state: process,
                    err_msg: error
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        let processResult = await persistence.getOneById(null, process.id);

        assert.equal(ProcessStatusV1.Running, processResult.status);
        assert.isNull(processResult.recovery_message);
        assert.isNull(processResult.recovery_queue_name);
    });


    // It_Should_Repeat_Recovery_Process()
    test('Repeat Recovery Process', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.type = "type";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;

        process = await persistence.create(null, process);

        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/repeat_process_recovery',
                {
                    state: process,
                    timeout: 0
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        let processResult = await persistence.getOneById(null, process.id);
        assert.equal(1, processResult.recovery_attempts);
    });

    test('Resume Process', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.type = "type";
        process.lock_token = "token";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Suspended;
        process.tasks = new Array<TaskStateV1>();

        let comment = "comment";

        process = await persistence.create(null, process);

        let processResult = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/resume_process',
                {
                    state: process,
                    comment: comment
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.equal(ProcessStatusV1.Starting, processResult.status);
        assert.equal("comment", processResult.comment);
    });

    test('Request For Response Process', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.type = "type";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Starting;

        process = await persistence.create(null, process);

        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/request_process_for_response',
                {
                    state: process,
                    request: "request",
                    queue_name: "queue",
                    message: new MessageV1()
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        let processResult = await persistence.getOneById(null, process.id);

        assert.equal(process.id, processResult.id);
        assert.equal("queue", processResult.recovery_queue_name);
        assert.equal("request", processResult.request);
        assert.equal(ProcessStatusV1.Suspended, processResult.status);
    });

    test('Complete Proces', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.type = "type";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Starting;

        process = await persistence.create(null, process);

        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/complete_process',
                {
                    state: process
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        let processResult = await persistence.getOneById(null, process.id);

        assert.equal(process.id, processResult.id);
        assert.equal(ProcessStatusV1.Completed, processResult.status);
    });

    test('Abort Process', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.type = "type";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;

        let comment = "comment";
        process = await persistence.create(null, process);

        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/abort_process',
                {
                    state: process,
                    comment: comment
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        let processResult = await persistence.getOneById(null, process.id);

        assert.equal(process.id, processResult.id);
        assert.equal(ProcessStatusV1.Aborted, processResult.status);
        assert.equal(comment, processResult.comment);
    });

    test('Delete Process', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.type = "type";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        process.recovery_message = new MessageV1();
        process.recovery_time = new Date();
        process.recovery_queue_name = "queue";

        await persistence.create(null, process);

        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/delete_process_by_id',
                {
                    process_id: process.id
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        let processResult = await persistence.getOneById(null, process.id);

        assert.isNull(processResult);
    });

    test('Continue With Recovery Process', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.type = "type";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        let messageEnvelop: MessageV1 = new MessageV1();
        messageEnvelop.correlation_id = "correlation id";
        messageEnvelop.message_type = "message type"
        messageEnvelop.message = "";

        process = await persistence.create(null, process);

        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/continue_and_recovery_process',
                {
                    state: process,
                    queue_name: "queue name",
                    message: messageEnvelop,
                    timeout: 0
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        let processResult = await persistence.getOneById(null, process.id); 

        assert.equal(ProcessStatusV1.Running, processResult.status);
        assert.equal(process.id, processResult.id);
        assert.equal(messageEnvelop.correlation_id, processResult.recovery_message.correlation_id);
        assert.equal(messageEnvelop.message_type, processResult.recovery_message.message_type);
        assert.equal("queue name", processResult.recovery_queue_name);
    });

    test('Update Process', async () => {

        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.type = "type";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        process.recovery_message = new MessageV1();
        process.recovery_time = new Date();
        process.recovery_queue_name = "queue";

        await persistence.create(null, process);

        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/update_process',
                {
                    state: process
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        let resultProcess = await persistence.getOneById(null, process.id);

        assert.isNotNull(resultProcess);
        assert.equal(resultProcess.id, process.id);
        assert.equal(resultProcess.recovery_queue_name, process.recovery_queue_name);
    });

    test('Get By Id Async If Process Id Not Null', async () => {


        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.type = "type";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        process.recovery_message = new MessageV1();
        process.recovery_time = new Date();
        process.recovery_queue_name = "queue";

        await persistence.create(null, process);

        let resultProcess = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/get_process_by_id',
                {
                    process_id: process.id
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.equal(resultProcess.id, process.id);
        assert.equal(resultProcess.recovery_queue_name, process.recovery_queue_name);
        assert.equal(resultProcess.type, process.type);
        assert.equal(resultProcess.lock_token, process.lock_token);
        assert.equal(resultProcess.status, process.status);
        assert.isNotNull(resultProcess.recovery_time);
    });

    test('Clear Recovery Message In Process', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.id = "id";
        process.lock_token = "token";
        process.type = "type";
        process.locked_until_time = new Date();
        process.status = ProcessStatusV1.Running;
        process.recovery_message = new MessageV1();
        process.recovery_time = new Date();
        process.recovery_queue_name = "queue";

        await persistence.create(null, process);

        await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/clear_process_recovery',
                {
                    state: process
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        let processResult = await persistence.getOneById(null, process.id);

        assert.equal(process.id, processResult.id);
        assert.isNull(processResult.recovery_queue_name);
        assert.isNull(processResult.recovery_time);
        assert.isNull(processResult.recovery_message);
    });


    test('Start Process', async () => {

        let message: MessageV1 = {
            correlation_id: "test_processes1",
            message_id: "msg_1",
            message_type: "Order.Msg",
            sent_time: new Date(Date.now() - 2 * 3600),
            message: "Sync orders"
        }

        let process = await new Promise<any>((resolve, reject) => {
            rest.post('/v1/process_states/start_process',
                {
                    process_type: "Process.Type1",
                    process_key: null,
                    task_type: "Task.TypeX",
                    queue_name: null,//"queue_x",
                    message: message,
                    ttl: null//5 * 3600
                },
                (err, req, res, result) => {
                    if (err == null) resolve(result);
                    else reject(err);
                }
            );
        });

        assert.equal(process.request_id, message.correlation_id);
        assert.equal(process.type, "Process.Type1");
        assert.equal(process.status, ProcessStatusV1.Starting);
        assert.isNotNull(process.start_time);
        assert.isNotNull(process.last_action_time);
        assert.isNotNull(process.expiration_time);
        assert.isNotNull(process.tasks);
        assert.equal(process.tasks.length, 1);
        assert.isNotNull(process.data);
    });
});