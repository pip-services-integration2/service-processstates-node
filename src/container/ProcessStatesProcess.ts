import { ProcessContainer } from 'pip-services3-container-nodex';

import { ProcessStatesServiceFactory } from '../build/ProcessStatesServiceFactory';
import { DefaultRpcFactory } from 'pip-services3-rpc-nodex';
import { DefaultSwaggerFactory } from 'pip-services3-swagger-nodex';

export class ProcessStatesProcess extends ProcessContainer {

    public constructor() {
        super("process_states", "Process states microservice");
        this._factories.add(new ProcessStatesServiceFactory);
        this._factories.add(new DefaultRpcFactory);
        this._factories.add(new DefaultSwaggerFactory);
    }
}
