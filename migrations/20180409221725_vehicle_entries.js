var constants = require('../models/constants.js');

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema
            .createTable('vehicle_entries', table => {
                table.integer('id').unsigned().notNullable();
                table.string('event_id', 15).notNullable();
                table.datetime('timestamp').notNullable();
                table.enu('direction', constants.VEHICLE_ENTRY_DIRECTION).notNullable();
            })
            .table('vehicle_entries', table => {
                table.foreign('event_id').references('events.event_id');
                table.primary('id');
            })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('vehicle_entries'),
    ]);
};
