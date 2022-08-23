"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessStatesHttpServiceV1 = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_rpc_nodex_1 = require("pip-services3-rpc-nodex");
class ProcessStatesHttpServiceV1 extends pip_services3_rpc_nodex_1.CommandableHttpService {
    constructor() {
        super('v1/process_states');
        this._dependencyResolver.put('controller', new pip_services3_commons_nodex_1.Descriptor('service-processstates', 'controller', 'default', '*', '1.0'));
    }
}
exports.ProcessStatesHttpServiceV1 = ProcessStatesHttpServiceV1;
//# sourceMappingURL=ProcessStatesHttpServiceV1.js.map