import { ObjectSchema } from 'pip-services3-commons-nodex';
import { TypeCode } from 'pip-services3-commons-nodex';

export class MessageV1Schema extends ObjectSchema {
    public constructor() {
        super();

        this.withOptionalProperty('correlation_id', TypeCode.String);
        this.withOptionalProperty('message_id', TypeCode.String);
        this.withOptionalProperty('message_type', TypeCode.String);
        this.withOptionalProperty('sent_time', TypeCode.DateTime);
        this.withOptionalProperty('message', TypeCode.String);
    }
}