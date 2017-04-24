var constants = require('../models/constants.js');
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
            table.integer('user_id').unsigned();
            table.integer('department_id').unsigned();
            table.integer('event_id');
            table.integer('role_id').unsigned();
            table.integer('type_in_shift_id').unsigned();
            table.boolean('is_production');
            table.string('comment');
            table.timestamp('modified_date').nullable();
            //unique
            table.unique(['user_id', 'department_id', 'event_id']);
            //references
            table.foreign('user_id').references('user_id').inTable(constants.USERS_TABLE_NAME);
            table.foreign('department_id').references('id').inTable(constants.VOL_DEPARTMENTS_TABLE_NAME);
            table.foreign('role_id').references('id').inTable(constants.VOL_DEPARTMENT_ROLES_TABLE_NAME);
            table.foreign('type_in_shift_id').references('id').inTable(constants.VOL_TYPES_IN_SHIFT_TABLE_NAME);
        }),
        knex.schema.createTable(constants.VOL_SHIFTS_TABLE_NAME, function(table) {
            //table.increments();
            table.integer('department_id').unsigned();
            table.integer('volunteer_id').unsigned();
            table.integer('shift_id').unsigned();
            table.string('location');
            table.integer('num_of_shift_managers');
            table.integer('num_of_volunteers');
            table.timestamp('start_time').nullable();
            table.timestamp('end_time').nullable();
            table.string('comment');
            table.timestamp('modified_date').nullable();
            table.primary(['volunteer_id', 'shift_id']);
            //references
            table.foreign('department_id').references('id').inTable(constants.VOL_DEPARTMENTS_TABLE_NAME);
            table.foreign('volunteer_id').references('id').inTable(constants.VOLUNTEERS_TABLE_NAME);
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
            //table.foreign(['shift_id', 'user_id']).references(['shift_id', 'volunteer_id']).inTable(constants.VOL_SHIFTS_TABLE_NAME);
        })
    ]);
};

exports.down = function(knex, Promise) {

};
