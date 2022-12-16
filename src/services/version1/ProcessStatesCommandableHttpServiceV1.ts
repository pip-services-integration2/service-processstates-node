import { Descriptor } from 'pip-services3-commons-nodex';
import { CommandableHttpService } from 'pip-services3-rpc-nodex';

export class ProcessStatesCommandableHttpServiceV1 extends CommandableHttpService {
    public constructor() {
        super('v1/process_states');
        this._dependencyResolver.put('controller', new Descriptor('service-processstates', 'controller', 'default', '*', '1.0'));
    }
}