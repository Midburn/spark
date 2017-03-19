var constants = require('../models/constants.js');

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.alterTable(constants.CAMPS_TABLE_NAME,function(table) {
            table.string('event_id',15);
            table.dropUnique('camp_name_he');
            table.dropUnique('camp_name_en');
            table.unique(['event_id','camp_name_en']);
            table.unique(['event_id','camp_name_he']);
        }),
        knex.schema.alterTable(constants.CAMP_DETAILS_TABLE_NAME,function(table) {
            table.unique(['camp_id']);
        }),
        knex.schema.createTable(constants.CAMP_MEMBERS_TABLE_NAME, function (table) {
            // table.string('event_id',15);
            table.integer('camp_id').unsigned();
            table.integer('user_id').unsigned();
            table.unique(['user_id']);
            table.index('camp_id');
            table.foreign('camp_id').references(constants.CAMPS_TABLE_NAME+'.id');
            table.foreign('user_id').references(constants.USERS_TABLE_NAME+'.user_id');
            table.enu('status',constants.CAMP_MEMBER_STATUS);
            table.text('addinfo_json','mediumtext');
        }),
        knex.schema.alterTable(constants.CAMP_DETAILS_TABLE_NAME,function(table) {
            table.unique('camp_id');
            table.foreign('camp_id').references(constants.CAMPS_TABLE_NAME+'.id');
        }),
        knex.schema.createTable('props',function(table) {
            table.string('prop_id',50);
            table.string('group_id',50);
            table.text('data_json');
            table.unique(['group_id','prop_id']);
            table.index('prop_id');
        })
    ]);
};

exports.down = function(knex, Promise) {};
