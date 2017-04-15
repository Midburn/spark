var constants = require('../models/constants');
exports.up = function(knex, Promise) {
    return Promise.all([
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
        knex.schema.table(constants.VOL_SCHEDULE_TABLE_NAME, function(table) {
            table.renameColumn('user_id', 'velunteer_id');
            //key
            table.primary(['velunteer_id', 'shift_id']);
            //references
            table.foreign('velunteer_id').references('id').inTable(constants.VOLUNTEERS_TABLE_NAME);
        }),
        knex.schema.dropTable(constants.VOLUNTEERS_TABLE_NAME + '_delete')
    ])
};

exports.down = function(knex, Promise) {

};