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

        //volunteers
        knex.schema.createTable(constants.VOLUNTEERS_TABLE_NAME, function(table) {
            table.increments();
            table.integer('user_id').unsigned();
            table.integer('department_id').unsigned();
            table.integer('event_id');
            table.integer('role_id').unsigned();
            table.boolean('is_production');
            table.string('comment');
            table.timestamp('modified_date');
            //unique
            table.unique(['user_id', 'department_id', 'event_id']);
            //references
            table.foreign('user_id').references('user_id').inTable(constants.USERS_TABLE_NAME);
            table.foreign('department_id').references('id').inTable(constants.VOL_DEPARTMENTS_TABLE_NAME);
            table.foreign('role_id').references('id').inTable(constants.VOL_DEPARTMENT_ROLES_TABLE_NAME);
        }),

        knex.schema.createTable('props', function(table) {
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