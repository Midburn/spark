var constants = require('../models/constants');
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table(constants.VOLUNTEERS_TABLE_NAME, (table) => {
            //table.foreign('user_id').references('id').inTable(constants.USERS_TABLE_NAME);
            table.foreign('department_id').references('id').inTable(constants.VOL_DEPARTMENTS_TABLE_NAME);
            table.foreign('role_id').references('id').inTable(constants.VOL_DEPARTMENT_ROLES_TABLE_NAME);
        })
    ]);
};

exports.down = function(knex, Promise) {

};