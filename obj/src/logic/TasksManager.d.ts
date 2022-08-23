import { TaskStateV1 } from "../data/version1/TaskStateV1";
import { ProcessStateV1 } from "../data/version1/ProcessStateV1";
import { MessageV1 } from "../data/version1/MessageV1";
export declare class TasksManager {
    static hasCompletedTasks(process: ProcessStateV1): boolean;
    static getExecutingTasks(process: ProcessStateV1): TaskStateV1;
    static startTasks(process: ProcessStateV1, taskType: string, queueName: string, message: MessageV1): void;
    static failTasks(process: ProcessStateV1, errorMessage: string): void;
    static getErrorMessage(process: ProcessStateV1): string;
    static rollbackTasks(process: ProcessStateV1): void;
    static completeTasks(process: ProcessStateV1): void;
}
