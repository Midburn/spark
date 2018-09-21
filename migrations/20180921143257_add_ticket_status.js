const constants = require('../models/constants');

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table(constants.TICKETS_TABLE_NAME, function (table) {
            table.string("ticket_status", 128).nullable();
        })
    ]);
};

exports.down = function(knex, Promise) {
  
};
