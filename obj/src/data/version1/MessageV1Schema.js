"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageV1Schema = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
class MessageV1Schema extends pip_services3_commons_nodex_1.ObjectSchema {
    constructor() {
        super();
        this.withOptionalProperty('correlation_id', pip_services3_commons_nodex_2.TypeCode.String);
        this.withOptionalProperty('message_id', pip_services3_commons_nodex_2.TypeCode.String);
        this.withOptionalProperty('message_type', pip_services3_commons_nodex_2.TypeCode.String);
        this.withOptionalProperty('sent_time', pip_services3_commons_nodex_2.TypeCode.DateTime);
        this.withOptionalProperty('message', pip_services3_commons_nodex_2.TypeCode.String);
    }
}
exports.MessageV1Schema = MessageV1Schema;
//# sourceMappingURL=MessageV1Schema.js.map