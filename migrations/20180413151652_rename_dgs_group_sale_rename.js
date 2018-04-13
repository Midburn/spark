const constants = require('../models/constants');

exports.up = function(knex, Promise) {
   return Promise.all([
       knex.schema.table(constants.CAMPS_TABLE_NAME, function (table) {
           table.renameColumn('dgs_tickets_quota', 'group_sale_tickets_quota');
       })
   ]);
};

exports.down = function(knex, Promise) {
   return Promise.all([
       knex.schema.table(constants.CAMPS_TABLE_NAME, function (table) {
           table.renameColumn('group_sale_tickets_quota', 'dgs_tickets_quota');
       })
   ]);
};
