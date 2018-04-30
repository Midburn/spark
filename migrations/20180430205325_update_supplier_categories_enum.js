var constants = require('../models/constants.js');

exports.up = function(knex, Promise) {
    // Schema + data migration for supplier categories enum
    // Remap: "carriage" -> "moving", everything else -> "other"

    return Promise.all([
        knex('suppliers').whereNotIn('supplier_category', ['carriage', 'moving']).update({'supplier_category': 'other'}),

        knex.schema.alterTable(constants.SUPPLIERS_TABLE_NAME, table => {
            table.enu('supplier_category', ['moving', 'other', 'carriage']).alter();
            // Temporarily add 'carriage' category for data migration
        }),

        knex('suppliers').where('supplier_category', '=', 'carriage').update({supplier_category: 'moving'}),

        knex.schema.alterTable(constants.SUPPLIERS_TABLE_NAME, table => {
            table.enu('supplier_category', ['moving', 'other']).alter();
        }),
    ]);
};

exports.down = function(knex, Promise) {

};
