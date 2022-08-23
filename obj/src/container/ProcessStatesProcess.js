"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessStatesProcess = void 0;
const pip_services3_container_nodex_1 = require("pip-services3-container-nodex");
const ProcessStatesServiceFactory_1 = require("../build/ProcessStatesServiceFactory");
const pip_services3_rpc_nodex_1 = require("pip-services3-rpc-nodex");
const pip_services3_swagger_nodex_1 = require("pip-services3-swagger-nodex");
class ProcessStatesProcess extends pip_services3_container_nodex_1.ProcessContainer {
    constructor() {
        super("process_states", "Process states microservice");
        this._factories.add(new ProcessStatesServiceFactory_1.ProcessStatesServiceFactory);
        this._factories.add(new pip_services3_rpc_nodex_1.DefaultRpcFactory);
        this._factories.add(new pip_services3_swagger_nodex_1.DefaultSwaggerFactory);
    }
}
exports.ProcessStatesProcess = ProcessStatesProcess;
//# sourceMappingURL=ProcessStatesProcess.js.map