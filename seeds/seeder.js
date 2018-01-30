const log = require('../libs/logger')(module);
const knex = require('../libs/db').knex;
const generate = require('./gen/generator');
const dropDb = require('./0_drops');
const addUsersToDb = require('./1_users');
const addEventsToDb = require('./2_event');
const addCampsToDb = require('./3_camps');
const MOCK_USERS_SCHEMA = require('./gen/mockSchema/users.schema');
const MOCK_EVENTS_SCHEMA = require('./gen/mockSchema/events.schema');
const MOCK_CAMPS_SCHEMA = require('./gen/mockSchema/camps.schema');
const utils = require('./util/utils');
const random = process.argv.includes('random');
const replaceStatic = process.argv.includes('replace');
const nosave = process.argv.includes('nosave');
const keepdb = process.argv.includes('keepdb');
const scale = Number(process.argv.pop());

if (random) {
    log.info('Generating random data...');
    if (!scale) {
        console.log('When generating random data you must state scale number as last parameter');
        process.exit(1);
    }
}
if (replaceStatic) {
    log.info('Replacing static data...');
}
if (nosave) {
    log.info('Running without saving to db');
}

if (scale > 40) {
    log.info('Chosen scale to big... try a smaller one');
}
const seed = async (scale = 1) => {
    try {
        if (!keepdb) {
            await dropDb(knex);
        }
        let mockData;
        if (random) {
            // Create some data for injection
            mockData = await generate(scale);
        } else {
            mockData = utils.getFromFiles([
                MOCK_USERS_SCHEMA.NAME,
                MOCK_EVENTS_SCHEMA.NAME,
                MOCK_CAMPS_SCHEMA.NAME
            ]);
        }
        const users = mockData[MOCK_USERS_SCHEMA.NAME];
        const events = mockData[MOCK_EVENTS_SCHEMA.NAME];
        const camps = mockData[MOCK_CAMPS_SCHEMA.NAME];
        if (!nosave) {
            await addUsersToDb(users);
            await addEventsToDb(events);
            await addCampsToDb(camps);
        }
        if (replaceStatic) {
            utils.saveFile(MOCK_USERS_SCHEMA.NAME, users);
            utils.saveFile(MOCK_EVENTS_SCHEMA.NAME, events);
            utils.saveFile(MOCK_CAMPS_SCHEMA.NAME, camps);
        }
        log.info(`Seeding process done, seeded ${users.length} users, ${camps.length} camps and ${events.length} events`);
        return mockData;
    } catch (err) {
        log.error(`An error occurred while seeding project - ${err}`);
    }

};
// Activate the function
seed(scale);
