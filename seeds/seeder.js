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

const seed = async () => {
    try {
        await dropDb(knex);
        const mockData = await generate(1);
        const users = mockData[MOCK_USERS_SCHEMA.NAME];
        const events = mockData[MOCK_EVENTS_SCHEMA.NAME];
        const camps = mockData[MOCK_CAMPS_SCHEMA.NAME];
        await addUsersToDb(users);
        await addEventsToDb(events);
        await addCampsToDb(camps);
        log.info(`Seeding process done, seeded ${users.length} users, ${camps.length} camps and ${events.length} events`);
    } catch (err) {
        log.error(`An error occurred while seeding project - ${err}`);
    }

};
seed();
