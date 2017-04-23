var constants = require('../models/constants.js');

exports.up = function (knex, Promise) {
    return Promise.all([

        // events table
        knex.schema.createTable(constants.EVENTS_TABLE_NAME, function (table) {
            table.string('event_id',15).primary();
            table.integer('ext_id_event_id');
            table.text('addinfo_json', 'mediumtext');
        }),

        // User table
        knex.schema.createTable(constants.USERS_TABLE_NAME, function (table) {
            // Basic ID + security fields
            table.timestamps();
            table.increments('user_id').primary();
            table.string('name');
            table.string('email', 100).unique();
            table.string('password', 100);
            table.string('reset_password_token', 32).unique();
            table.timestamp('reset_password_expires');
            table.string('email_validation_token', 32).unique();
            table.timestamp('email_validation_expires');
            table.boolean('enabled').defaultTo(true);
            table.boolean('validated').defaultTo(false);
            table.string('roles', 200).defaultTo('');

            // Profile fields
            table.string('first_name', 64);
            table.string('last_name', 64);
            table.enu('gender', constants.USER_GENDERS);
            table.date('date_of_birth');
            table.string('israeli_id', 9);
            table.string('address', 100);
            table.string('cell_phone', 10);
            table.string('extra_phone', 10);
            table.boolean('npo_member').defaultTo(false);
            table.string('facebook_id', 50);
            table.string('facebook_token', 255);

            /**
              * User Current Status - Defines the current status of profile
              */
            table.string('current_event_id', 15);
            table.timestamp('current_last_status');
            table.enu('current_status', constants.USER_CURRENT_STATUS);
            table.integer('current_event_id_ticket_count').unsigned();

            // additional information
            table.text('addinfo_json', 'mediumtext');
        }),

        // Payments table
        knex.schema.createTable(constants.PAYMENTS_TABLE_NAME, function (table) {
            table.timestamps();
            table.increments('payment_id').primary();
            table.string('private_sale_token', 40);
            table.string('public_sale_token', 40);
            table.string('url', 256);
            table.integer('user_id').unsigned();
            table.boolean('payed').defaultTo(false);
        }),

        // NPO table
        knex.schema.createTable(constants.NPO_MEMBERS_TABLE_NAME, function (table) {
            table.timestamps();
            table.integer('user_id').unsigned().primary();
            table.enu('membership_status', constants.NPO_MEMBERSHIP_STATUSES).defaultTo(constants.NPO_MEMBERSHIP_STATUSES_DEFAULT);
            table.timestamp('application_date');
            table.date('membership_start_date');
            table.date('membership_end_date');
            table.text('form_previous_p', 'LONGTEXT');
            table.text('form_future_p', 'LONGTEXT');
            table.text('form_why_join', 'LONGTEXT');
        }),

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
        }),

        // camps table: add accept families, facebook page url, contact person id
        knex.schema.table(constants.CAMPS_TABLE_NAME, function (table) {
            table.boolean("accept_families");
            table.string("facebook_page_url");
            table.integer("contact_person_id").unsigned();
        }),

        // this table might be created and filled with data from an external process
        // that's why we use createTableIfNotExists - to allow for the option that the table already exists
        knex.schema.createTableIfNotExists(constants.DRUPAL_USERS_TABLE_NAME, function (table) {
            table.string('name', 60); // Unique user name.
            table.string('pass', 128); // User’s password (hashed)
            table.integer('status').unsigned(); // Whether the user is active(1) or blocked(0).
        }),

        //volunteer departments
        knex.schema.createTable(constants.VOL_DEPARTMENTS_TABLE_NAME, function(table) {
            table.increments();
            table.string('name_en');
            table.string('name_he');
        }).then(function() {
            return knex(constants.VOL_DEPARTMENTS_TABLE_NAME).insert([
                { name_en: 'Tech', name_he: 'טכנולוגיה' },
                { name_en: 'Gate', name_he: 'שער' },
                { name_en: 'Volunteers', name_he: 'מתנדבים' }
            ]);
        }),
        //roles in the department
        knex.schema.createTable(constants.VOL_DEPARTMENT_ROLES_TABLE_NAME, function(table) {
            table.increments();
            table.string('name')

        }).then(function() {
            return knex(constants.VOL_DEPARTMENT_ROLES_TABLE_NAME).insert([
                { name: 'Admin' },
                { name: 'Admin of department / HR' },
                { name: 'View all shifts' },
                { name: 'View all personal data' }
            ]);
        }),
        //types in shift
        knex.schema.createTable(constants.VOL_TYPES_IN_SHIFT_TABLE_NAME, function(table) {
            table.increments();
            table.string('name');
        }).then(function() {
            return knex(constants.VOL_TYPES_IN_SHIFT_TABLE_NAME).insert([
                { name: 'Volunteer' },
                { name: 'Manager' },
                { name: 'Day Manager' },
                { name: 'Shift Manager' },
                { name: 'Other' }
            ]);
        }),
        //volunteers
        knex.schema.createTable(constants.VOLUNTEERS_TABLE_NAME, function(table) {
            table.integer('user_id').unsigned();
            table.integer('department_id').unsigned();
            table.integer('event_id').unsigned();
            table.integer('role_id').unsigned();
            table.integer('type_in_shift_id').unsigned();
            table.boolean('is_prodcution');
            table.string('comment');
            table.timestamp('modified_date');
            //key
            table.primary(['user_id', 'department_id', 'event_id'])
            //references
            table.foreign('user_id').references('user_id').inTable(constants.USERS_TABLE_NAME);
            table.foreign('department_id').references('id').inTable(constants.VOL_DEPARTMENTS_TABLE_NAME);
            table.foreign('role_id').references('id').inTable(constants.VOL_DEPARTMENT_ROLES_TABLE_NAME);
            table.foreign('type_in_shift_id').references('id').inTable(constants.VOL_TYPES_IN_SHIFT_TABLE_NAME);
        }),
        knex.schema.createTable(constants.VOL_SHIFTS_TABLE_NAME, function(table) {
            table.increments();
            table.integer('department_id').unsigned()
            table.string('location');
            table.integer('num_of_shift_managers');
            table.integer('num_of_volunteers');
            table.timestamp('start_time');
            table.timestamp('end_time');
            table.string('comment');
            table.timestamp('modified_date');
            //references
            table.foreign('department_id').references('id').inTable(constants.VOL_DEPARTMENTS_TABLE_NAME);
        }),
        knex.schema.createTable(constants.VOL_SCHEDULE_TABLE_NAME, function(table) {
            table.integer('user_id').unsigned();
            table.integer('shift_id').unsigned();
            table.boolean('attended');
            table.string('comment');
            //key
            table.primary(['user_id', 'shift_id'])
            //references
            table.foreign('user_id').references('user_id').inTable(constants.VOLUNTEERS_TABLE_NAME);
            table.foreign('shift_id').references('id').inTable(constants.VOL_SHIFTS_TABLE_NAME);

        })
    ]);
};

exports.down = function (knex, Promise) { };
