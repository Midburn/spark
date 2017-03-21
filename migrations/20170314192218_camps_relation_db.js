var constants = require('../models/constants.js');

exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.alterTable(constants.CAMPS_TABLE_NAME, function (table) {
            // if (!knex.schema.hasColumn(constants.CAMPS_TABLE_NAME, 'event_id')) {
            table.string('event_id', 15);
            table.dropUnique('camp_name_he');
            table.dropUnique('camp_name_en');
            table.unique(['event_id', 'camp_name_en']);
            table.unique(['event_id', 'camp_name_he']);
            // }

            // Detailed info
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

            // Contact person info on top id
            table.string('contact_person_name', 100);
            table.string('contact_person_email', 100);
            table.string('contact_person_phone', 14);

        }),
        knex.schema.createTable(constants.CAMP_MEMBERS_TABLE_NAME, function (table) {
            table.integer('camp_id').unsigned();
            table.integer('user_id').unsigned();
            table.unique(['user_id']);
            table.index('camp_id');
            table.foreign('camp_id').references(constants.CAMPS_TABLE_NAME + '.id');
            table.foreign('user_id').references(constants.USERS_TABLE_NAME + '.user_id');
            table.enu('status', constants.CAMP_MEMBER_STATUS);
            table.text('addinfo_json', 'mediumtext');
        }),

        knex.schema.createTable('props', function (table) {
            table.string('prop_id', 50);
            table.string('group_id', 50);
            table.text('data_json');
            table.unique(['group_id', 'prop_id']);
            table.index('prop_id');
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('props'),
        knex.schema.dropTable(constants.CAMP_MEMBERS_TABLE_NAME),
    ]);
};

