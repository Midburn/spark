var constants = require('../models/constants.js');

exports.up = function (knex, Promise) {
    return Promise.all([

        // Camps table
        knex.schema.createTable(constants.CAMPS_TABLE_NAME, function (table) {
            table.timestamps();

            // General information

            table.increments('id').primary();

            table.string('camp_name_he', 50).unique();
            table.string('camp_name_en', 50).unique();
            table.text('camp_desc_he', 'mediumtext');
            table.text('camp_desc_en', 'mediumtext');

            // Modifiers
            table.enu('type', constants.CAMP_TYPES);
            table.enu('status', constants.CAMP_STATUSES);
            table.boolean('enabled').defaultTo(false);

            // Users relations
            table.integer('main_contact').unsigned();
            table.integer('moop_contact').unsigned();
            table.integer('safety_contact').unsigned();
        }),

        // Camp Details table
        knex.schema.createTable(constants.CAMP_DETAILS_TABLE_NAME, function (table) {
            table.enu('camp_activity_time', constants.CAMP_ACTIVITY_TIMES);
            table.boolean('child_friendly');
            table.enu('noise_level', constants.CAMP_NOISE_LEVELS);
            table.integer('public_activity_area_sqm');
            table.text('public_activity_area_desc', 'mediumtext');
            table.boolean('support_art');

            // Location
            table.text('location_comments', 'mediumtext');
            table.text('camp_location_street');
            table.text('camp_location_street_time');
            table.integer('camp_location_area');
            table.integer('camp_id').unsigned();
        }),
        
        // Add users camp_id field
        knex.schema.table(constants.USERS_TABLE_NAME, function (table) {
            table.integer('camp_id').unsigned();
        })
    ]);
};

exports.down = function (knex, Promise) {};
