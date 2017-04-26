var constants = require('../models/constants.js');

exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable(constants.CAMP_MEMBERS_TABLE_NAME, function (table) {
            table.integer('camp_id').unsigned();
            table.integer('user_id').unsigned();
            table.unique(['camp_id', 'user_id']);
            table.index(['camp_id', 'user_id']);
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

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('props'),
        knex.schema.dropTable(constants.CAMP_MEMBERS_TABLE_NAME)
    ]);
};
