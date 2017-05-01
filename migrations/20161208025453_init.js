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
            table.timestamp('email_validation_expires').nullable();
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
            table.string('cell_phone', 16);
            table.string('extra_phone', 10);
            table.boolean('npo_member').defaultTo(false);
            table.string('facebook_id', 50);
            table.string('facebook_token', 255);

            /**
              * User Current Status - Defines the current status of profile
              */
            table.string('current_event_id', 15);
            table.timestamp('current_last_status').nullable();
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
            table.timestamp('application_date').nullable();
            table.date('membership_start_date');
            table.date('membership_end_date');
            table.text('form_previous_p', 'LONGTEXT');
            table.text('form_future_p', 'LONGTEXT');
            table.text('form_why_join', 'LONGTEXT');
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        // Tickets table
        knex.schema.dropTable(constants.NPO_MEMBERS_TABLE_NAME),
        knex.schema.dropTable(constants.PAYMENTS_TABLE_NAME),
        knex.schema.dropTable(constants.EVENTS_TABLE_NAME),
        knex.schema.dropTable(constants.USERS_TABLE_NAME)
    ])
};
