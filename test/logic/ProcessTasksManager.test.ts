import { ProcessStateV1 } from "../../src/data/version1/ProcessStateV1";
import { TasksManager } from "../../src/logic/TasksManager";
import { TaskStateV1 } from "../../src/data/version1/TaskStateV1";
import { TaskStatusV1 } from "../../src/data/version1/TaskStatusV1";


const assert = require('chai').assert;

suite('ProcessTasksManager', () => {

    test('Test Return False If Process Does Not Have Completed Tasks', () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        process.tasks = new Array<TaskStateV1>();
        let result = TasksManager.hasCompletedTasks(process);
        assert.isFalse(result);
    });



    test('Test Return True If Process Have Completed Tasks', () => {
        let task: TaskStateV1 = new TaskStateV1();
        task.status = TaskStatusV1.Completed;

        let process: ProcessStateV1 = new ProcessStateV1();
        process.tasks = new Array<TaskStateV1>();
        process.tasks.push(task);

        let result = TasksManager.hasCompletedTasks(process);
        assert.isTrue(result);
    });

    test('Test Return Tasks If Process Has Executing Tasks', () => {
        let task: TaskStateV1 = new TaskStateV1();
        task.status = TaskStatusV1.Executing;

        let process: ProcessStateV1 = new ProcessStateV1();
        process.tasks = new Array<TaskStateV1>();
        process.tasks.push(task);

        let result = TasksManager.getExecutingTasks(process);

        assert.isNotNull(result);
        assert.include(task, result);
    });

    test('Test Return Error If Process Does Not Have Executing Tasks', () => {
        let process: ProcessStateV1 = new ProcessStateV1();

        let err = null;
        try {
            TasksManager.getExecutingTasks(process);
        } catch(ex) {
            err = ex;
        }

        assert.isNotNull(err);
    });

    test('Test Create New Tasks', async () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        TasksManager.startTasks(process, "test type", "test queue", null);
        assert.equal(1, process.tasks.length);
    });

    test('Test Catch Exceptions Of Tasks Starting', () => {
        let process: ProcessStateV1 = new ProcessStateV1();
        let err = null;
        
        try {
            TasksManager.startTasks(process, null, "test queue", null);
        } catch(ex) {
            err = ex;
        }

        assert.isNotNull(err);
    });

    test('Test Failing_Tasks', () => {
        let task: TaskStateV1 = new TaskStateV1();
        task.status = TaskStatusV1.Executing;

        let process: ProcessStateV1 = new ProcessStateV1();
        process.tasks = new Array<TaskStateV1>();
        process.tasks.push(task);

        let errorMessage = "Error message";

        TasksManager.failTasks(process, errorMessage);

        assert.equal(1, process.tasks.length);
        assert.equal(TaskStatusV1.Failed, process.tasks[0].status);
        assert.include(errorMessage, process.tasks[0].error_message);
    });

    test('Test Change State For All Executing Processs To Failed And Add Default Error', () => {
        let task: TaskStateV1 = new TaskStateV1();
        task.status = TaskStatusV1.Executing;

        let process: ProcessStateV1 = new ProcessStateV1();

        TasksManager.failTasks(process, null);
        assert.equal(0, process.tasks.length);

        process.tasks = new Array<TaskStateV1>();
        process.tasks.push(task);

        TasksManager.failTasks(process, null);

        assert.equal(1, process.tasks.length);
        assert.equal(TaskStatusV1.Failed, process.tasks[0].status);
        assert.include("Unexpected error", process.tasks[0].error_message);
    });

    test('Test Return Last Error Message From Failed Tasks In Process', () => {
        let task: TaskStateV1 = new TaskStateV1();
        task.status = TaskStatusV1.Failed;
        task.error_message = "error 1";

        let task2: TaskStateV1 = new TaskStateV1();
        task2.status = TaskStatusV1.Failed;
        task2.error_message = "error 2";

        let process: ProcessStateV1 = new ProcessStateV1();
        process.tasks = new Array<TaskStateV1>();
        process.tasks.push(task);
        process.tasks.push(task2);

        let error = TasksManager.getErrorMessage(process);

        assert.isNotNull(error);
        assert.equal(task2.error_message, error);
    });

    test('Test Return Null If Current Process Does Not Have Error Messages', () => {
        let task: TaskStateV1 = new TaskStateV1();
        task.status = TaskStatusV1.Executing;

        let process: ProcessStateV1 = new ProcessStateV1();
        process.tasks = new Array<TaskStateV1>();
        process.tasks.push(task);

        let error = TasksManager.getErrorMessage(process);

        assert.isNull(error);
    });


    test('Test Complete Tasks', () => {
        let task: TaskStateV1 = new TaskStateV1();
        task.status = TaskStatusV1.Executing;

        let process: ProcessStateV1 = new ProcessStateV1();

        TasksManager.completeTasks(process);
        assert.equal(0, process.tasks.length);

        process.tasks = new Array<TaskStateV1>();
        process.tasks.push(task);

        TasksManager.completeTasks(process);

        assert.equal(1, process.tasks.length);
        assert.equal(TaskStatusV1.Completed, process.tasks[0].status);
        assert.isNull(process.tasks[0].error_message);
    });

    test('Test Rollback Tasks', () => {
        let task: TaskStateV1 = new TaskStateV1();
        task.status = TaskStatusV1.Executing;
        let task2: TaskStateV1 = new TaskStateV1();
        task2.status = TaskStatusV1.Completed;
        let process: ProcessStateV1 = new ProcessStateV1();
        TasksManager.rollbackTasks(process);
        assert.equal(0, process.tasks.length);
        process.tasks = new Array<TaskStateV1>();
        process.tasks.push(task);
        process.tasks.push(task2);
        TasksManager.rollbackTasks(process);
        assert.equal(1, process.tasks.length);
    });
});