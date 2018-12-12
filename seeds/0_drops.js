const log = require('../libs/logger')(module);
const constants = require('../models/constants');

const dropDbs = async function(knex) {
    try {
        console.log('Dropping DB data...');
        await knex(constants.SUPPLIERS_RELATIONS_TABLE_NAME).del();
        await knex(constants.TICKETS_TABLE_NAME).del();
        await knex(constants.CAMP_MEMBERS_TABLE_NAME).del();
        await knex(constants.CAMPS_TABLE_NAME).del();
        await knex(constants.USERS_TABLE_NAME).del();
        await knex(constants.SUPPLIERS_TABLE_NAME).del();
        await knex(constants.ENTRIES_TABLE_NAME).del();
        await knex(constants.EVENTS_TABLE_NAME).del();
        console.log('Dropped DB data successfully');
    } catch (error) {
        log.error('Spark encountered an error while seeding and droping tables:');
        log.error(error);
    }
};

module.exports = dropDbs;
