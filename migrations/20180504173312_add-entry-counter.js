const constants = require('../models/constants.js');

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema
            .createTable(constants.ENTRIES_TABLE_NAME, table => {
                table.increments('id').primary();
                table.string('event_id', 15).notNullable();
                table.datetime('timestamp').notNullable();
                table.enu('direction', constants.ENTRY_DIRECTION).notNullable();
                table.enu('type', constants.ENTRY_TYPE).notNullable();
                table.foreign('event_id').references('events.event_id');
            }),
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('vehicle_entries'),
    ]);
};
