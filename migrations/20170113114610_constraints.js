var constants = require('../models/constants.js');

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table(constants.PAYMENTS_TABLE_NAME, function(table) {
            table.foreign('user_id').references('users.user_id');
        }),
        knex.schema.table(constants.NPO_MEMBERS_TABLE_NAME, function(table) {
            table.foreign('user_id', 'users.user_id');
        }),
        knex.schema.table(constants.CAMPS_TABLE_NAME, function(table) {
            table.foreign('main_contact').references('users.user_id');
            table.foreign('moop_contact').references('users.user_id');
            table.foreign('safety_contact').references('users.user_id');
        }),
        knex.schema.table(constants.USERS_TABLE_NAME, function(table) {
            table.integer('camp_id').unsigned();
            table.foreign('camp_id').references('id').inTable(constants.CAMPS_TABLE_NAME);
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table(constants.PAYMENTS_TABLE_NAME, function(table) {
            table.dropForeign('user_id');
        }),
        knex.schema.table(constants.NPO_MEMBERS_TABLE_NAME, function(table) {
            table.dropForeign('user_id');
        }),
        knex.schema.table(constants.CAMPS_TABLE_NAME, function(table) {
            table.dropForeign('main_contact');
            table.dropForeign('moop_contact');
            table.dropForeign('safety_contact');
        }),
        knex.schema.table(constants.USERS_TABLE_NAME, function(table) {
            table.dropForeign('camp_id');
        })
    ]);
};
