const constants = require('../models/constants');
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.hasColumn('users_groups_membership', 'status')
        .then(exists => {
            if (!exists) {
                return knex.schema.alterTable('users_groups_membership', table => {
                        table.enu('status', constants.CAMP_MEMBER_STATUS)
                });
            }
        })
    ])
};

exports.down = function(knex, Promise) {
  
};
