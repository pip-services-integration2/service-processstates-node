import { ConfigParams } from 'pip-services3-commons-nodex';

import { ProcessStatesFilePersistence } from '../../src/persistence/ProcessStatesFilePersistence';
import { ProcessStatesPersistenceFixture } from './ProcessStatesPersistenceFixture';

suite('ProcessStatesFilePersistence', ()=> {
    let persistence: ProcessStatesFilePersistence;
    let fixture: ProcessStatesPersistenceFixture;
    
    setup(async () => {
        persistence = new ProcessStatesFilePersistence('./data/process_states.test.json');

        fixture = new ProcessStatesPersistenceFixture(persistence);

        await persistence.open(null);
        await persistence.clear(null);
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