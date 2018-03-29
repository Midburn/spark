var constants = require('../models/constants.js');
exports.up = function(knex, Promise) {
  return Promise.all([

        // Suppliers table
        knex.schema.createTable(constants.SUPPLIERS_CONTRACTS_TABLE_NAME, function(table) {
            table.timestamps();

            table.integer('supplier_id', 9).unsigned().primary();
            table.string('contract_name', 100);
            table.string('contract_path', 100);
        }),
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable(constants.SUPPLIERS_CONTRACTS_TABLE_NAME),
    ])
};
