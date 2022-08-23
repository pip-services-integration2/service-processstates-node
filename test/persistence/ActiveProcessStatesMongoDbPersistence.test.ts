let process = require('process');

import { ConfigParams } from 'pip-services3-commons-nodex';

import { ActiveProcessStatesMongoDbPersistence } from '../../src/persistence/ActiveProcessStatesMongoDbPersistence';
import { ProcessStatesPersistenceFixture } from './ProcessStatesPersistenceFixture';

suite('ActiveProcessStatesMongoDbPersistence', ()=> {
    let persistence: ActiveProcessStatesMongoDbPersistence;
    let fixture: ProcessStatesPersistenceFixture;

    setup(async () => {
        var MONGO_DB = process.env["MONGO_DB"] || "test";
        var MONGO_COLLECTION = process.env["MONGO_COLLECTION"] || "process_states";
        var MONGO_SERVICE_HOST = process.env["MONGO_SERVICE_HOST"] || "localhost";
        var MONGO_SERVICE_PORT = process.env["MONGO_SERVICE_PORT"] || "27017";
        var MONGO_SERVICE_URI = process.env["MONGO_SERVICE_URI"];

        var dbConfig = ConfigParams.fromTuples(
            "collection", MONGO_COLLECTION,
            "connection.database", MONGO_DB,
            "connection.host", MONGO_SERVICE_HOST,
            "connection.port", MONGO_SERVICE_PORT,
            "connection.uri", MONGO_SERVICE_URI
        );

        persistence = new ActiveProcessStatesMongoDbPersistence();
        persistence.configure(dbConfig);

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