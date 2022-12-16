"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessStatesCommandableHttpServiceV1 = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_rpc_nodex_1 = require("pip-services3-rpc-nodex");
class ProcessStatesCommandableHttpServiceV1 extends pip_services3_rpc_nodex_1.CommandableHttpService {
    constructor() {
        super('v1/process_states');
        this._dependencyResolver.put('controller', new pip_services3_commons_nodex_1.Descriptor('service-processstates', 'controller', 'default', '*', '1.0'));
    }
}
exports.ProcessStatesCommandableHttpServiceV1 = ProcessStatesCommandableHttpServiceV1;
//# sourceMappingURL=ProcessStatesCommandableHttpServiceV1.js.map