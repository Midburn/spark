var constants = require('../models/constants.js');

exports.up = function(knex, Promise) {
    return Promise.all([

        // Suppliers table
        knex.schema.createTable(constants.SUPPLIERS_TABLE_NAME, function(table) {
            table.timestamps();

            table.integer('supplier_number', 9).unsigned().primary();
            table.string('supplier_name_en', 100);
            table.string('supplier_name_he', 100);
            table.string('main_contact_name', 50);
            table.string('main_contact_position', 50);
            table.integer('main_contact_phone_number').unsigned();
            table.string('courier_contact_name', 50);
            table.integer('courier_contact_phone_number').unsigned();
            table.enu('supplier_category', constants.SUPPLIER_CATEGORIES);


            
            table.text('supplier_website_link', 'mediumtext');
            table.text('supplier_midmarket_link', 'mediumtext');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable(constants.SUPPLIERS_TABLE_NAME)
    ])
};
