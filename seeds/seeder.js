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
const ADMIN = require('./static/admin').BASE_ADMIN,
    CAMP = require('./static/admin').BASE_CAMP,
    EVENT = require('./static/admin').BASE_EVENT;

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

const correlateData = (users, camps)=> {
    const campMembers = [];
    for (const camp of camps) {
        const campAdmin = users.find(user => user.user_id === camp.contact_person_id);
        if (campAdmin) {
            campAdmin.camp_id = camp.camp_id;
            campMembers.push({camp_id: camp.camp_id, user_id: campAdmin.user_id});
        }
    }
    return campMembers;
};

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
        // Create link between camps and users
        const campMembers = correlateData(users, camps);
        if (replaceStatic) {
            utils.saveFile(MOCK_USERS_SCHEMA.NAME, users);
            utils.saveFile(MOCK_EVENTS_SCHEMA.NAME, events);
            utils.saveFile(MOCK_CAMPS_SCHEMA.NAME, camps);
        }
        if (!nosave) {
            await addUsersToDb(users);
            await addEventsToDb(events);
            await addCampsToDb(camps);
            await addCampMembers(campMembers);
        }
        log.info(`Seeding process done, seeded ${users.length} users, ${camps.length} camps and ${events.length} events`);
        process.exit(0);
        return mockData;
    } catch (err) {
        log.error(`An error occurred while seeding project - ${err}`);
        process.exit(-1);
    }

};
// Activate the function
seed(scale);
