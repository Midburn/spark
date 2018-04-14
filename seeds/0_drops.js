const log = require('../libs/logger')(module);
const constants = require('../models/constants');

const dropDbs = async function(knex) {
    try {
        await knex(constants.SUPPLIERS_RELATIONS_TABLE_NAME).del();
        await knex(constants.TICKETS_TABLE_NAME).del();
        await knex(constants.CAMP_MEMBERS_TABLE_NAME).del();
        await knex(constants.CAMPS_TABLE_NAME).del();
        await knex(constants.USERS_TABLE_NAME).del();
        await knex(constants.EVENTS_TABLE_NAME).del();
        await knex(constants.SUPPLIERS_TABLE_NAME).del();
    } catch (error) {
        log.error('Spark encountered an error while seeding and droping tables:');
        log.error(error);
    }
};

module.exports = dropDbs;
