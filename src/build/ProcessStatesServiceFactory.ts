import { Factory } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';

import { ProcessStatesMongoDbPersistence } from '../persistence/ProcessStatesMongoDbPersistence';
import { ProcessStatesFilePersistence } from '../persistence/ProcessStatesFilePersistence';
import { ProcessStatesMemoryPersistence } from '../persistence/ProcessStatesMemoryPersistence';
import { ProcessStatesController } from '../logic/ProcessStatesController';
import { ProcessStatesCommandableHttpServiceV1 } from '../services/version1/ProcessStatesCommandableHttpServiceV1';
import { ProcessCloseExpiredProcessor } from '../logic/ProcessCloseExpiredProcessor';
import { ProcessRecoveryProcessor } from '../logic/ProcessRecoveryProcessor';
import { ProcessTruncateProcessor } from '../logic/ProcessTruncateProcessor';

export class ProcessStatesServiceFactory extends Factory {
	public static Descriptor = new Descriptor("service-processstates", "factory", "default", "default", "1.0");
	public static MemoryPersistenceDescriptor = new Descriptor("service-processstates", "persistence", "memory", "*", "1.0");
	public static FilePersistenceDescriptor = new Descriptor("service-processstates", "persistence", "file", "*", "1.0");
	public static MongoDbPersistenceDescriptor = new Descriptor("service-processstates", "persistence", "mongodb", "*", "1.0");
	public static ControllerDescriptor = new Descriptor("service-processstates", "controller", "default", "*", "1.0");
	public static HttpServiceDescriptor = new Descriptor("service-processstates", "service", "commandable-http", "*", "1.0");

	public static CloseExpiredProcessorDescriptor = new Descriptor("service-processstates", "processor", "expired", "*", "1.0");
	public static RecoveryProcessorDescriptor = new Descriptor("service-processstates", "processor", "recovery", "*", "1.0");
	public static TruncateProcessorDescriptor = new Descriptor("service-processstates", "processor", "truncate", "*", "1.0");

	constructor() {
		super();
		this.registerAsType(ProcessStatesServiceFactory.MemoryPersistenceDescriptor, ProcessStatesMemoryPersistence);
		this.registerAsType(ProcessStatesServiceFactory.FilePersistenceDescriptor, ProcessStatesFilePersistence);
		this.registerAsType(ProcessStatesServiceFactory.MongoDbPersistenceDescriptor, ProcessStatesMongoDbPersistence);
		this.registerAsType(ProcessStatesServiceFactory.ControllerDescriptor, ProcessStatesController);
		this.registerAsType(ProcessStatesServiceFactory.HttpServiceDescriptor, ProcessStatesCommandableHttpServiceV1);

		this.registerAsType(ProcessStatesServiceFactory.CloseExpiredProcessorDescriptor, ProcessCloseExpiredProcessor);
		this.registerAsType(ProcessStatesServiceFactory.RecoveryProcessorDescriptor, ProcessRecoveryProcessor);
		this.registerAsType(ProcessStatesServiceFactory.TruncateProcessorDescriptor, ProcessTruncateProcessor);
	}

}
