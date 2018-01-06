const constants = require('../models/constants');
exports.up = function(knex, Promise) {
    return Promise.all([

        knex.schema.alterTable('users_groups_membership', table => {
                table.enu('status', constants.CAMP_MEMBER_STATUS)
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
