const constants = require('../models/constants');

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.alterTable(constants.EVENTS_TABLE_NAME, function (table) {
            table.string('ext_id_event_id', 15).alter();
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
