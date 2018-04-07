var constants = require('../models/constants.js');
exports.up = function(knex, Promise) {
  return Promise.all([

        // Suppliers table
        knex.schema.createTable(constants.SUPPLIERS_CONTRACTS_TABLE_NAME, function(table) {
            table.timestamps();
            table.string('supplier_id', 9).primary();
            table.string('file_name', 100);
        }),
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable(constants.SUPPLIERS_CONTRACTS_TABLE_NAME),
    ])
};
