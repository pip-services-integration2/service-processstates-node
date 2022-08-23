import { CommandSet, ICommand, Command, ObjectSchema, FilterParamsSchema, TypeCode } from "pip-services3-commons-nodex";
import { PagingParamsSchema, FilterParams, PagingParams } from "pip-services3-commons-nodex";
import { IProcessStatesController } from './IProcessStatesController';
import { Parameters } from 'pip-services3-commons-nodex';
import { MessageV1Schema, MessageV1, ProcessStateV1Schema, ProcessStateV1 } from "../data/version1";


export class ProcessStatesCommandSet extends CommandSet {
    private _controller: IProcessStatesController;

    constructor(controller: IProcessStatesController) {
        super();
        this._controller = controller;
        this.addCommand(this.makeGetProcessesCommand());
        this.addCommand(this.makeGetProcessesByIdCommand());
        this.addCommand(this.makeStartProcessCommand());
        this.addCommand(this.makeActivateOrStartProcessCommand());
        this.addCommand(this.makeActivateProcessCommand());
        this.addCommand(this.makeActivateProcessByKeyCommand());
        this.addCommand(this.makeRollbackProcessCommand());
        this.addCommand(this.makeContinueProcessCommand());
        this.addCommand(this.makeContinueAndRecoveryProcessCommand());
        this.addCommand(this.makeRepeatProcessRecoveryCommand());
        this.addCommand(this.makeClearProcessRecoveryCommand());
        this.addCommand(this.makeFailAndContinueProcessCommand());
        this.addCommand(this.makeFailAndRecoverProcessCommand());
        this.addCommand(this.makeSuspendProcessCommand());
        this.addCommand(this.makeFailProcessCommand());
        this.addCommand(this.makeResumeProcessCommand());
        this.addCommand(this.makeCompleteProcessCommand());
        this.addCommand(this.makeAbortProcessCommand());
        this.addCommand(this.makeUpdateProcessCommand());
        this.addCommand(this.makeDeleteProcessByIdCommand());
        this.addCommand(this.makeRequestProcessForResponceCommand());
    }

    private makeGetProcessesCommand(): ICommand {
        return new Command(
            'get_processes',
            new ObjectSchema(true)
                .withOptionalProperty('filter', new FilterParamsSchema())
                .withOptionalProperty('paging', new PagingParamsSchema()),
            async (correlationId: string, args: Parameters) => {
                let filter = FilterParams.fromValue(args.get('filter'));
                let paging = PagingParams.fromValue(args.get('paging'));
                return await this._controller.getProcesses(correlationId, filter, paging);
            }
        );
    }

    private makeGetProcessesByIdCommand(): ICommand {
        return new Command(
            'get_process_by_id',
            new ObjectSchema(true)
                .withRequiredProperty('process_id', TypeCode.String),
            async (correlationId: string, args: Parameters) => {
                let processId = args.getAsString('process_id');
                return await this._controller.getProcessById(correlationId, processId);
            }
        );
    }

    private makeStartProcessCommand(): ICommand {
        return new Command(
            'start_process',
            new ObjectSchema(true)
                .withOptionalProperty('process_type', TypeCode.String)
                .withOptionalProperty('process_key', TypeCode.String)
                .withOptionalProperty('task_type', TypeCode.String)
                .withOptionalProperty('queue_name', TypeCode.String)
                .withOptionalProperty('message', new MessageV1Schema())
                .withOptionalProperty('ttl', TypeCode.Long),
            async (correlationId: string, args: Parameters) => {
                let processType = args.getAsString('process_type');
                let processKey = args.getAsString('process_key');
                let taskType = args.getAsString('task_type');
                let queueName = args.getAsString('queue_name');
                let message: MessageV1 = args.getAsObject('message');
                let ttl = args.getAsLongWithDefault('ttl', 0);

                return await this._controller.startProcess(correlationId, processType, processKey, taskType, queueName, message, ttl);
            }
        );
    }

    private makeActivateOrStartProcessCommand(): ICommand {
        return new Command(
            'activate_or_start_process',
            new ObjectSchema(true)
                .withOptionalProperty('process_type', TypeCode.String)
                .withOptionalProperty('process_key', TypeCode.String)
                .withOptionalProperty('task_type', TypeCode.String)
                .withOptionalProperty('queue_name', TypeCode.String)
                .withOptionalProperty('message', new MessageV1Schema())
                .withOptionalProperty('ttl', TypeCode.Long),
            async (correlationId: string, args: Parameters) => {
                let processType = args.getAsString('process_type');
                let processKey = args.getAsString('process_key');
                let taskType = args.getAsString('task_type');
                let queueName = args.getAsString('queue_name');
                let message: MessageV1 = args.getAsObject('message');
                let ttl = args.getAsLongWithDefault('ttl', 0);

                return await this._controller.activateOrStartProcess(correlationId, processType, processKey, taskType, queueName, message, ttl);
            }
        );
    }

    private makeActivateProcessCommand(): ICommand {
        return new Command(
            'activate_process',
            new ObjectSchema(true)
                .withRequiredProperty('process_id', TypeCode.String)
                .withOptionalProperty('task_type', TypeCode.String)
                .withOptionalProperty('queue_name', TypeCode.String)
                .withOptionalProperty('message', new MessageV1Schema()),
            async (correlationId: string, args: Parameters) => {
                let processId = args.getAsString('process_id');
                let taskType = args.getAsString('task_type');
                let queueName = args.getAsString('queue_name');
                let message: MessageV1 = args.getAsObject('message');
                return await this._controller.activateProcess(correlationId, processId, taskType, queueName, message);
            }
        );
    }

    private makeActivateProcessByKeyCommand(): ICommand {
        return new Command(
            'activate_process_by_key',
            new ObjectSchema(true)
                .withOptionalProperty('process_type', TypeCode.String)
                .withOptionalProperty('process_key', TypeCode.String)
                .withOptionalProperty('task_type', TypeCode.String)
                .withOptionalProperty('queue_name', TypeCode.String)
                .withOptionalProperty('message', new MessageV1Schema()),
            async (correlationId: string, args: Parameters) => {
                let processType = args.getAsString('process_type');
                let processKey = args.getAsString('process_key');
                let taskType = args.getAsString('task_type');
                let queueName = args.getAsString('queue_name');
                let message: MessageV1 = args.getAsObject('message');
                return await this._controller.activateProcessByKey(correlationId, processType, processKey, taskType, queueName, message);
            }
        );
    }

    private makeRollbackProcessCommand(): ICommand {
        return new Command(
            'rollback_process',
            new ObjectSchema(true)
                .withRequiredProperty('state', new ProcessStateV1Schema()),
            async (correlationId: string, args: Parameters) => {
                let state: ProcessStateV1 = args.getAsObject('state');
                return await this._controller.rollbackProcess(correlationId, state);
            }
        );
    }

    private makeContinueProcessCommand(): ICommand {
        return new Command(
            'continue_process',
            new ObjectSchema(true)
                .withRequiredProperty('state', new ProcessStateV1Schema()),
            async (correlationId: string, args: Parameters) => {
                let state: ProcessStateV1 = args.getAsObject('state');
                return await this._controller.continueProcess(correlationId, state);
            }
        );
    }

    private makeContinueAndRecoveryProcessCommand(): ICommand {
        return new Command(
            'continue_and_recovery_process',
            new ObjectSchema(true)
                .withRequiredProperty('state', new ProcessStateV1Schema())
                .withOptionalProperty('queue_name', TypeCode.String)
                .withOptionalProperty('message', new MessageV1Schema())
                .withRequiredProperty('timeout', TypeCode.Long),
            async (correlationId: string, args: Parameters) => {
                let state: ProcessStateV1 = args.getAsObject('state');
                let queueName = args.getAsString('queue_name');
                let message: MessageV1 = args.getAsObject('message');
                let timeout = args.getAsLongWithDefault('timeout', 0);
                return await this._controller.continueAndRecoverProcess(correlationId, state, queueName, message, timeout);
            }
        );
    }

    private makeRepeatProcessRecoveryCommand(): ICommand {
        return new Command(
            'repeat_process_recovery',
            new ObjectSchema(true)
                .withRequiredProperty('state', new ProcessStateV1Schema())
                .withRequiredProperty('timeout', TypeCode.Long),
            async (correlationId: string, args: Parameters) => {
                let state: ProcessStateV1 = args.getAsObject('state');
                let timeout = args.getAsLong('timeout');
                return await this._controller.repeatProcessRecovery(correlationId, state, timeout);
            }
        );
    }

    private makeClearProcessRecoveryCommand(): ICommand {
        return new Command(
            'clear_process_recovery',
            new ObjectSchema(true)
                .withRequiredProperty('state', new ProcessStateV1Schema()),
            async (correlationId: string, args: Parameters) => {
                let state: ProcessStateV1 = args.getAsObject('state');
                return await this._controller.clearProcessRecovery(correlationId, state);
            }
        );
    }

    private makeFailAndContinueProcessCommand(): ICommand {
        return new Command(
            'fail_and_continue_process',
            new ObjectSchema(true)
                .withRequiredProperty('state', new ProcessStateV1Schema())
                .withRequiredProperty('err_msg', TypeCode.String),
            async (correlationId: string, args: Parameters) => {
                let state: ProcessStateV1 = args.getAsObject('state');
                let errMsg = args.getAsObject('err_msg');
                return await this._controller.failAndContinueProcess(correlationId, state, errMsg);
            }
        );
    }

    private makeFailAndRecoverProcessCommand(): ICommand {
        return new Command(
            'fail_and_recover_process',
            new ObjectSchema(true)
                .withRequiredProperty('state', new ProcessStateV1Schema())
                .withRequiredProperty('err_msg', TypeCode.String)
                .withOptionalProperty('queue_name', TypeCode.String)
                .withOptionalProperty('message', new MessageV1Schema())
                .withRequiredProperty('timeout', TypeCode.Long),
            async (correlationId: string, args: Parameters) => {
                let state: ProcessStateV1 = args.getAsObject('state');
                let errMsg = args.getAsObject('err_msg');
                let queueName = args.getAsString('queue_name');
                let message: MessageV1 = args.getAsObject('message');
                let timeout = args.getAsLong('timeout');
                return await this._controller.failAndRecoverProcess(correlationId, state, errMsg, queueName, message, timeout);
            }
        );
    }

    private makeSuspendProcessCommand(): ICommand {
        return new Command(
            'suspend_process',
            new ObjectSchema(true)
                .withRequiredProperty('state', new ProcessStateV1Schema())
                .withOptionalProperty('request', TypeCode.String)
                .withOptionalProperty('queue_name', TypeCode.String)
                .withOptionalProperty('message', new MessageV1Schema())
                .withRequiredProperty('timeout', TypeCode.Long),
            async (correlationId: string, args: Parameters) => {
                let state: ProcessStateV1 = args.getAsObject('state');
                let request = args.getAsString('request');
                let queueName = args.getAsString('queue_name');
                let message: MessageV1 = args.getAsObject('message');
                let timeout = args.getAsLong('timeout');
                return await this._controller.suspendProcess(correlationId, state, request, queueName, message, timeout);
            }
        );
    }



    private makeFailProcessCommand(): ICommand {
        return new Command(
            'fail_process',
            new ObjectSchema(true)
                .withRequiredProperty('state', new ProcessStateV1Schema())
                .withRequiredProperty('err_msg', TypeCode.String),
            async (correlationId: string, args: Parameters) => {
                let state: ProcessStateV1 = args.getAsObject('state');
                let errMsg = args.getAsString('err_msg');
                return await this._controller.failProcess(correlationId, state, errMsg);
            }
        );
    }

    private makeResumeProcessCommand(): ICommand {
        return new Command(
            'resume_process',
            new ObjectSchema(true)
                .withRequiredProperty('state', new ProcessStateV1Schema())
                .withRequiredProperty('comment', TypeCode.String),
            async (correlationId: string, args: Parameters) => {
                let state: ProcessStateV1 = args.getAsObject('state');
                let comment = args.getAsString('comment');
                return await this._controller.resumeProcess(correlationId, state, comment);
            }
        );
    }

    private makeCompleteProcessCommand(): ICommand {
        return new Command(
            'complete_process',
            new ObjectSchema(true)
                .withRequiredProperty('state', new ProcessStateV1Schema()),
            async (correlationId: string, args: Parameters) => {
                let state: ProcessStateV1 = args.getAsObject('state');
                return await this._controller.completeProcess(correlationId, state);
            }
        );
    }

    private makeAbortProcessCommand(): ICommand {
        return new Command(
            'abort_process',
            new ObjectSchema(true)
                .withRequiredProperty('state', new ProcessStateV1Schema())
                .withRequiredProperty('comment', TypeCode.String),
            async (correlationId: string, args: Parameters) => {
                let state: ProcessStateV1 = args.getAsObject('state');
                let comment = args.getAsString('comment');
                return await this._controller.abortProcess(correlationId, state, comment);
            }
        );
    }

    private makeUpdateProcessCommand(): ICommand {
        return new Command(
            'update_process',
            new ObjectSchema(true)
                .withRequiredProperty('state', new ProcessStateV1Schema()),
            async (correlationId: string, args: Parameters) => {
                let state: ProcessStateV1 = args.getAsObject('state');
                return await this._controller.updateProcess(correlationId, state);
            }
        );
    }

    private makeDeleteProcessByIdCommand(): ICommand {
        return new Command(
            'delete_process_by_id',
            new ObjectSchema(true)
                .withRequiredProperty('process_id', TypeCode.String),
            async (correlationId: string, args: Parameters) => {
                let processId = args.getAsString('process_id');
                return await this._controller.deleteProcessById(correlationId, processId);
            }
        );
    }

    private makeRequestProcessForResponceCommand(): ICommand {
        return new Command(
            'request_process_for_response',
            new ObjectSchema(true)
                .withRequiredProperty('state', new ProcessStateV1Schema())
                .withRequiredProperty('request', TypeCode.String)
                .withOptionalProperty('queue_name', TypeCode.String)
                .withOptionalProperty('message', new MessageV1Schema()),
            async (correlationId: string, args: Parameters) => {
                let state: ProcessStateV1 = args.getAsObject('state');
                let request = args.getAsString('request');
                let queueName = args.getAsString('queue_name');
                let message: MessageV1 = args.getAsObject('message');
                return await this._controller.requestProcessForResponse(correlationId, state, request, queueName, message);
            }
        );
    }
}