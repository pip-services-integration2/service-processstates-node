
import { IReferences, Descriptor } from 'pip-services3-commons-nodex';
import { ILogger } from 'pip-services3-components-nodex';
import { CompositeLogger } from 'pip-services3-components-nodex';
import { RecoveryManager } from './RecoveryManager';
import { IMessageQueue } from 'pip-services3-messaging-nodex';
import { MessageEnvelope } from 'pip-services3-messaging-nodex';
import { ProcessStateV1 } from '../data/version1/ProcessStateV1';
import { MessageV1 } from '../data/version1/MessageV1';


export class RecoveryController {
    private _references: IReferences;
    private _logger: ILogger;

    public constructor(references: IReferences, logger?: ILogger) {
        this._references = references;
        if (!logger) {
            logger = new CompositeLogger(references);
        }
        this._logger = logger;
    }

    public isRecoveryDue(status: ProcessStateV1): boolean {
        return RecoveryManager.isRecoveryDue(status);
    }

    public isAttemptsExceeded(status: ProcessStateV1): boolean {
        //TEMPORARY, to get workflows flowing
        return false;
        return RecoveryManager.isAttemptsExceeded(status);
    }

    public async sendRecovery(status: ProcessStateV1): Promise<boolean> {
        var message = status.recovery_message;
        if (message == null) {
            this._logger.error(status.id, null, "Process " + status + " is missing recovery message");
            return false;
        }

        var queue = status.recovery_queue_name != null
        // TODO: must change mechanism of geting queues
            ? this._references.getOneRequired<IMessageQueue>(new Descriptor("*", "queue","*", status.recovery_queue_name, "1.0")) : null;
        if (queue == null) {
            this._logger.error(status.id, null, "Process " + status + " is missing recovery queue name");
            return false;
        }

        // Send a recovery message
        message.correlation_id = message.correlation_id || status.id;
        
        await queue.send(message.correlation_id, this._convertToMessageEnvelope(message));

        this._logger.info(status.id, "Sent recovery message for process " + status + " to " + queue);

        return true;
    }

    private _convertToMessageEnvelope(msg: MessageV1): MessageEnvelope {
        var item = new MessageEnvelope(msg.correlation_id, msg.message_type, msg.message);
        item.sent_time = msg.sent_time;
        item.message_id = msg.message_id;
        return item;
    }
}
