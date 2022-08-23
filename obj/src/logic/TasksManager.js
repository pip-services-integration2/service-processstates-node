"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksManager = void 0;
const TaskStatusV1_1 = require("../data/version1/TaskStatusV1");
const TaskStateV1_1 = require("../data/version1/TaskStateV1");
const ProcessInvalidStateExceptionV1_1 = require("../data/version1/ProcessInvalidStateExceptionV1");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
class TasksManager {
    static hasCompletedTasks(process) {
        let items = process.tasks.filter((a) => { return a.status == TaskStatusV1_1.TaskStatusV1.Completed; });
        return items.length > 0;
    }
    static getExecutingTasks(process) {
        var task = null;
        // Find running task
        if (process.tasks != null) {
            var items = process.tasks.filter((a) => { return a.status == TaskStatusV1_1.TaskStatusV1.Executing; });
            task = items.length > 0 ? items[0] : null;
        }
        // If task does exist raise error
        if (task == null)
            throw new ProcessInvalidStateExceptionV1_1.ProcessInvalidStateExceptionV1("Executed task wasn't found in process " + process.id);
        return task;
    }
    static startTasks(process, taskType, queueName, message) {
        if (taskType == null)
            throw new pip_services3_commons_nodex_1.ApplicationException("Tasks type cannot be null");
        process.tasks = process.tasks || new Array();
        // Create a new one if it was not found
        let task = new TaskStateV1_1.TaskStateV1();
        task.type = taskType,
            task.status = TaskStatusV1_1.TaskStatusV1.Executing,
            task.start_time = new Date(),
            task.queue_name = queueName,
            task.message = message;
        process.tasks.push(task);
    }
    static failTasks(process, errorMessage) {
        process.tasks = process.tasks || new Array();
        // Mark previously running but uncompleted activities as failed
        for (let task of process.tasks) {
            if (task.status == TaskStatusV1_1.TaskStatusV1.Executing) {
                task.status = TaskStatusV1_1.TaskStatusV1.Failed;
                task.end_time = new Date();
                task.error_message = errorMessage || "Unexpected error";
            }
        }
    }
    static getErrorMessage(process) {
        for (var index = process.tasks.length - 1; index >= 0; index--) {
            var task = process.tasks[index];
            if (task.status == TaskStatusV1_1.TaskStatusV1.Failed)
                return task.error_message;
        }
        return null;
    }
    static rollbackTasks(process) {
        process.tasks = process.tasks || new Array();
        process.tasks = process.tasks.filter(a => a.status != TaskStatusV1_1.TaskStatusV1.Executing);
    }
    static completeTasks(process) {
        process.tasks = process.tasks || new Array();
        // Mark previously running but uncompleted activities as failed
        for (var task of process.tasks) {
            if (task.status == TaskStatusV1_1.TaskStatusV1.Executing) {
                task.status = TaskStatusV1_1.TaskStatusV1.Completed;
                task.end_time = new Date();
                task.error_message = null;
            }
        }
    }
}
exports.TasksManager = TasksManager;
//# sourceMappingURL=TasksManager.js.map