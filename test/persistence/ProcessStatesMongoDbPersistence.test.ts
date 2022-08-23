import { ConfigParams } from 'pip-services3-commons-nodex';

import { ProcessStatesMongoDbPersistence } from '../../src/persistence/ProcessStatesMongoDbPersistence';
import { ProcessStatesPersistenceFixture } from './ProcessStatesPersistenceFixture';

suite('ProcessStatesMongoDbPersistence', ()=> {
    let persistence: ProcessStatesMongoDbPersistence;
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

        persistence = new ProcessStatesMongoDbPersistence();
        persistence.configure(dbConfig);

        fixture = new ProcessStatesPersistenceFixture(persistence);

        await persistence.open(null);
        await persistence.clear(null);
    });
    
    teardown(async () => {
        persistence.close(null);
    });

    test('CRUD Operations', async () => {
        fixture.testCrudOperations();
    });

    test('Get with Filters', async () => {
        fixture.testGetWithFilter();
    });

    test('Get Active', async () => {
        fixture.testGetActiveProcess();
    });

    test('Truncate', async () => {
        fixture.testTruncateProcesses();
    });

});