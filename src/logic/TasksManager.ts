import { TaskStatusV1 } from "../data/version1/TaskStatusV1";
import { TaskStateV1 } from "../data/version1/TaskStateV1";
import { ProcessStateV1 } from "../data/version1/ProcessStateV1";
import { ProcessInvalidStateExceptionV1 } from '../data/version1/ProcessInvalidStateExceptionV1';
import { MessageV1 } from "../data/version1/MessageV1";
import { ApplicationException } from "pip-services3-commons-nodex";

export class TasksManager {
    public static hasCompletedTasks(process: ProcessStateV1): boolean {
        let items = process.tasks.filter(
            (a) => {return a.status == TaskStatusV1.Completed}
        );
        return items.length > 0;
    }

    public static getExecutingTasks(process: ProcessStateV1): TaskStateV1 {

        var task: TaskStateV1 = null;
        // Find running task
        if (process.tasks != null) {
            var items = process.tasks.filter(
                (a) => { return a.status == TaskStatusV1.Executing}
            )
            task = items.length > 0 ? items[0] : null;
        }

        // If task does exist raise error
        if (task == null)
            throw new ProcessInvalidStateExceptionV1("Executed task wasn't found in process " + process.id);
        return task;
    }

    public static startTasks(process: ProcessStateV1, taskType: string, queueName: string, message: MessageV1): void {
        if (taskType == null)
            throw new ApplicationException("Tasks type cannot be null");

        process.tasks = process.tasks || new Array<TaskStateV1>();

        // Create a new one if it was not found
        let task = new TaskStateV1();

        task.type = taskType,
            task.status = TaskStatusV1.Executing,
            task.start_time = new Date(),
            task.queue_name = queueName,
            task.message = message;

        process.tasks.push(task);
    }

    public static failTasks(process: ProcessStateV1, errorMessage: string) {
        process.tasks = process.tasks || new Array<TaskStateV1>();

        // Mark previously running but uncompleted activities as failed
        for (let task of process.tasks) {
            if (task.status == TaskStatusV1.Executing) {
                task.status = TaskStatusV1.Failed;
                task.end_time = new Date();
                task.error_message = errorMessage || "Unexpected error";
            }
        }
    }

    public static getErrorMessage(process: ProcessStateV1): string {
        for (var index = process.tasks.length - 1; index >= 0; index--) {
            var task = process.tasks[index];
            if (task.status == TaskStatusV1.Failed)
                return task.error_message;
        }

        return null;
    }
    public static rollbackTasks(process: ProcessStateV1) {
        process.tasks = process.tasks || new Array<TaskStateV1>();

        process.tasks = process.tasks.filter(
            a => a.status != TaskStatusV1.Executing
        );
    }

    public static completeTasks(process: ProcessStateV1) {
        process.tasks = process.tasks || new Array<TaskStateV1>();

        // Mark previously running but uncompleted activities as failed
        for (var task of process.tasks) {
            if (task.status == TaskStatusV1.Executing) {
                task.status = TaskStatusV1.Completed;
                task.end_time = new Date();
                task.error_message = null;
            }
        }
    }
}

