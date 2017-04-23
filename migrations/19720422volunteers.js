const constants = require('../models/constants.js');

exports.up = function(knex, Promise) {
    return Promise.all([
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
            table.increments();
            table.integer('user_id');
            table.integer('department_id');
            table.integer('event_id');
            table.integer('role_id');
            table.integer('type_in_shift_id');
            table.boolean('is_prodcution');
            table.string('comment');
            table.timestamp('modified_date');
            //unique
            table.unique(['user_id', 'department_id', 'event_id']);
            //references
            table.foreign('user_id').references('id').inTable(constants.USERS_TABLE_NAME);
            table.foreign('department_id').references('id').inTable(constants.VOL_DEPARTMENTS_TABLE_NAME);
            table.foreign('role_id').references('id').inTable(constants.VOL_DEPARTMENT_ROLES_TABLE_NAME);
            table.foreign('type_in_shift_id').references('id').inTable(constants.VOL_TYPES_IN_SHIFT_TABLE_NAME);
        }),
        knex.schema.createTable(constants.VOL_SHIFTS_TABLE_NAME, function(table) {
            table.increments();
            table.integer('department_id').unsigned();
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
            table.primary(['user_id', 'shift_id']);
            //references
            table.foreign('user_id').references('user_id').inTable(constants.VOLUNTEERS_TABLE_NAME);
            table.foreign('shift_id').references('id').inTable(constants.VOL_SHIFTS_TABLE_NAME);

        }),
        knex.schema.table(constants.VOL_SCHEDULE_TABLE_NAME, function(table) {
            table.renameColumn('user_id', 'velunteer_id');
            //key
            table.primary(['velunteer_id', 'shift_id']);
            //references
            table.foreign('velunteer_id').references('id').inTable(constants.VOLUNTEERS_TABLE_NAME);
        }),

        // camps relations
        knex.schema.createTable(constants.CAMP_MEMBERS_TABLE_NAME, function (table) {
            table.integer('camp_id').unsigned();
            table.integer('user_id').unsigned();
            table.unique(['camp_id', 'user_id']);
            table.index(['camp_id', 'user_id']);
            table.foreign('camp_id').references(constants.CAMPS_TABLE_NAME + '.id');
            table.foreign('user_id').references(constants.USERS_TABLE_NAME + '.user_id');
            table.enu('status', constants.CAMP_MEMBER_STATUS);

            // additional information
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

exports.down = function(knex, Promise) {
    throw Error("computer says no");
};
