const constants = require('../models/constants');

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable(constants.USER_ROLES_TABLE_NAME, (table) => {
            table.increments('id').primary();
            table.integer('camp_id').unsigned();
            table.integer('user_id').unsigned();
            table.string('event_id',32);
            table.string('role',100);
            table.foreign('user_id').references('user_id').inTable(constants.USERS_TABLE_NAME);
            table.foreign('event_id').references('event_id').inTable(constants.EVENTS_TABLE_NAME);
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable(constants.CAMPS_TABLE_NAME)
    ])
};
