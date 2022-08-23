"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessLockedExceptionV1 = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const ProcessExceptionV1_1 = require("./ProcessExceptionV1");
class ProcessLockedExceptionV1 extends ProcessExceptionV1_1.ProcessExceptionV1 {
    /**
     * Creates an error instance and assigns its values.
     *
     * @param correlationId    (optional) a unique transaction id to trace execution through call chain.
     * @param message           (optional) a human-readable description of the error.
     */
    constructor(correlationId = null, message = 'Process is locked') {
        super(correlationId, 'PROCESS_LOCKED', message);
        super.category = pip_services3_commons_nodex_1.ErrorCategory.Conflict;
        super.status = 409;
    }
}
exports.ProcessLockedExceptionV1 = ProcessLockedExceptionV1;
//# sourceMappingURL=ProcessLockedExceptionV1.js.map