const constants = require('../models/constants.js');

exports.up = function(knex, Promise) {
    return knex.schema.alterTable(constants.SUPPLIERS_RELATIONS_TABLE_NAME, function(t) {
        // Remove foreign key to open it for changes
        t.dropForeign('supplier_id');
    }).then(() => {
        return Promise.all([
            // Alter columns to fix migrations
            knex.schema.alterTable(constants.SUPPLIERS_TABLE_NAME, function(t) {
                // alter primary key to varchar
                t.string('supplier_id', 9).alter();
            }),
            knex.schema.alterTable(constants.SUPPLIERS_RELATIONS_TABLE_NAME, function(t) {
                // alter foreign key to varchar
                t.string('supplier_id', 9).alter();
            }),
            // Suppliers entance info, keeps all the data that when supplier enter the gate
            knex.schema.createTable(constants.SUPPLIERS_GATE_ENTRANCE_INFO_TABLE_NAME, function(table) {
                table.increments('record_id').primary();
                table.string('supplier_id',9).references('supplier_id').inTable(constants.SUPPLIERS_TABLE_NAME);
                table.string('event_id',15).references('event_id').inTable(constants.EVENTS_TABLE_NAME);
                table.integer('vehicle_plate_number').unsigned();
                table.integer('number_of_people_entered').unsigned();
                table.integer('allowed_visa_hours').unsigned();
                table.dateTime('enterance_time');
                table.dateTime('departure_time');
                table.enu('supplier_status', constants.SUPPLIER_STATUS_CATEGORIES);

            })
        ]);
    });
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable(constants.SUPPLIERS_GATE_ENTRANCE_INFO_TABLE_NAME),
    ]);
};
