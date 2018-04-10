var constants = require('../models/constants.js');

exports.up = function(knex, Promise) {
    return Promise.all([

        // Suppliers table
        knex.schema.createTable(constants.SUPPLIERS_TABLE_NAME, function(table) {
            table.timestamps();

            table.integer('supplier_id', 9).unsigned().primary();
            table.string('supplier_name_en', 100);
            table.string('supplier_name_he', 100);
            table.string('main_contact_name', 50);
            table.string('main_contact_position', 50);
            table.integer('main_contact_phone_number').unsigned();

            table.enu('supplier_category', constants.SUPPLIER_CATEGORIES);

            table.text('supplier_website_link', 'mediumtext');
            table.text('supplier_midmarket_link', 'mediumtext');
            table.text('comments', 'largetext');
        }),

        // Suppliers relations table
        knex.schema.createTable(constants.SUPPLIERS_RELATIONS_TABLE_NAME, function(table) {
            table.integer('supplier_id', 9).unsigned();
            table.integer('camp_id').unsigned();
            table.string('event_id',15);
            table.unique(['supplier_id', 'camp_id','event_id']);
            table.string('courier_contact_name', 50);
            table.integer('courier_contact_phone_number').unsigned();

            table.foreign('supplier_id').references('supplier_id').inTable(constants.SUPPLIERS_TABLE_NAME);
            table.foreign('camp_id').references('id').inTable(constants.CAMPS_TABLE_NAME);
            table.foreign('event_id').references('event_id').inTable(constants.EVENTS_TABLE_NAME);

        }),

    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable(constants.SUPPLIERS_TABLE_NAME),
        knex.schema.dropTable(constants.SUPPLIERS_RELATIONS_TABLE_NAME),
    ])
};
