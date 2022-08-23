import { ConfigParams } from 'pip-services3-commons-nodex';

import { ProcessStatesMemoryPersistence } from '../../src/persistence/ProcessStatesMemoryPersistence';
import { ProcessStatesPersistenceFixture } from './ProcessStatesPersistenceFixture';

suite('ProcessStatesMemoryPersistence', ()=> {
    let persistence: ProcessStatesMemoryPersistence;
    let fixture: ProcessStatesPersistenceFixture;
    
    setup(async () => {
        persistence = new ProcessStatesMemoryPersistence();
        persistence.configure(new ConfigParams());
        
        fixture = new ProcessStatesPersistenceFixture(persistence);
        
        await persistence.open(null);
    });
    
    teardown(async () => {
        await persistence.close(null);
    });
        
    test('CRUD Operations', async () => {
        await fixture.testCrudOperations();
    });

    test('Get with Filters', async () => {
        await fixture.testGetWithFilter();
    });

    test('Get Active', async () => {
        await fixture.testGetActiveProcess();
    });

    test('Truncate', async () => {
        await fixture.testTruncateProcesses();
    });

});