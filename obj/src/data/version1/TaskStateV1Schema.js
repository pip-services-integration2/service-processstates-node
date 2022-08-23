"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskStateV1Schema = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const MessageV1Schema_1 = require("./MessageV1Schema");
class TaskStateV1Schema extends pip_services3_commons_nodex_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('type', pip_services3_commons_nodex_2.TypeCode.String);
        this.withOptionalProperty('status', pip_services3_commons_nodex_2.TypeCode.String);
        this.withOptionalProperty('start_time', pip_services3_commons_nodex_2.TypeCode.DateTime);
        this.withOptionalProperty('end_time', pip_services3_commons_nodex_2.TypeCode.DateTime);
        this.withOptionalProperty('queue_name', pip_services3_commons_nodex_2.TypeCode.String);
        this.withOptionalProperty('message', new MessageV1Schema_1.MessageV1Schema());
        this.withOptionalProperty('error_message', pip_services3_commons_nodex_2.TypeCode.String);
    }
}
exports.TaskStateV1Schema = TaskStateV1Schema;
//# sourceMappingURL=TaskStateV1Schema.js.map