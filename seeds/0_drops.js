const log = require('../libs/logger')(module);

const dropDbs = async function(knex) {
    try {
        await knex('camps').del();
        await knex('users').del();
        await knex('events').del()
    } catch (error) {
        log.error('Spark encountered an error while seeding and droping tables:');
        log.error(error);
    }
};

module.exports = dropDbs;
