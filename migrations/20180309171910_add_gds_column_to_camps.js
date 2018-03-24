const constants = require('../models/constants');

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table(constants.CAMPS_TABLE_NAME, function (table) {
            table.integer("dgs_tickets_quota").unsigned();
        })
    ]);
};

exports.down = function(knex, Promise) {

};
