import { Factory } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
export declare class ProcessStatesServiceFactory extends Factory {
    static Descriptor: Descriptor;
    static MemoryPersistenceDescriptor: Descriptor;
    static FilePersistenceDescriptor: Descriptor;
    static MongoDbPersistenceDescriptor: Descriptor;
    static ControllerDescriptor: Descriptor;
    static HttpServiceDescriptor: Descriptor;
    static CloseExpiredProcessorDescriptor: Descriptor;
    static RecoveryProcessorDescriptor: Descriptor;
    static TruncateProcessorDescriptor: Descriptor;
    constructor();
}
