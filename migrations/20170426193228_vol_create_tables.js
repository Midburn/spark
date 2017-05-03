var constants = require('../models/constants');
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists(constants.VOLUNTEERS_TABLE_NAME)
        .then(() => {
        return knex.schema.createTable(constants.VOLUNTEERS_TABLE_NAME, function(table) {
            table.increments();
            table.integer('user_id');
            table.integer('department_id').unsigned();
            table.integer('event_id').unsigned();
            table.integer('role_id').unsigned();
            table.boolean('is_production');
            table.string('comment');
            table.timestamp('modified_date');
            //unique
            table.unique(['user_id', 'department_id', 'event_id']);
           
        })}),
        //volunteer departments
        knex.schema.createTableIfNotExists(constants.VOL_DEPARTMENTS_TABLE_NAME, function(table) {
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
        knex.schema.createTableIfNotExists(constants.VOL_DEPARTMENT_ROLES_TABLE_NAME, function(table) {
            table.increments();
            table.string('name')

        }).then(function() {
            return knex(constants.VOL_DEPARTMENT_ROLES_TABLE_NAME).insert([
                { name: 'Admin' },
                { name: 'Admin of department / HR' },
                { name: 'View all shifts' },
                { name: 'View all personal data' }
            ]);
        })
    ]);
};

exports.down = function(knex, Promise) {

};