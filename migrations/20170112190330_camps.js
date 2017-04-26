var constants = require('../models/constants.js');

exports.up = function(knex, Promise) {
    return Promise.all([

        // Camps table
        knex.schema.createTable(constants.CAMPS_TABLE_NAME, function(table) {
            table.timestamps();

            // General information
            table.increments('id').primary();
            table.string('event_id', 15);
            table.enu('__prototype', constants.CAMP_PROTOTYPE);
            table.string('camp_name_he', 50);
            table.string('camp_name_en', 50);
            table.unique(['event_id', 'camp_name_en']);
            table.unique(['event_id', 'camp_name_he']);
            table.text('camp_desc_he', 'mediumtext');
            table.text('camp_desc_en', 'mediumtext');

            // Modifiers
            table.string('type', 100); // comma delimited of constants.CAMP_TYPES
            table.enu('status', constants.CAMP_STATUSES);
            table.boolean('web_published').defaultTo(false);

            // Detailed info
            table.string('camp_activity_time', 100); // comma delimited constants.CAMP_ACTIVITY_TIMES);
            table.boolean('child_friendly');
            table.enu('noise_level', constants.CAMP_NOISE_LEVELS);
            table.integer('public_activity_area_sqm');
            table.text('public_activity_area_desc', 'mediumtext');
            table.boolean('support_art');

            // Location and camp data
            table.text('location_comments', 'mediumtext');
            table.text('camp_location_street');
            table.text('camp_location_street_time');
            table.text('camp_location_area');
            table.text('addinfo_json', 'mediumtext');

            // Users relations
            table.integer('main_contact').unsigned();
            table.integer('moop_contact').unsigned();
            table.integer('safety_contact').unsigned();

            // Contact person info on top id
            table.string('contact_person_name', 100);
            table.string('contact_person_email', 100);
            table.string('contact_person_phone', 14);
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable(constants.CAMPS_TABLE_NAME)
    ])
};
