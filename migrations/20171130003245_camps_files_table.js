const CONSTS = require('../models/constants')

exports.up = function(knex, Promise) {
  return Promise.all([
      knex.schema.createTable(CONSTS.CAMP_FILES_TABLE_NAME, (table) => {
          table.timestamps();

          table.increments('file_id').primary();
          table.integer('camp_id').unsigned();
          table.integer('uploader_id').unsigned();
          table.string('file_path', 500);
          table.string('file_type', 20);
          table.index('camp_id');
          table.foreign('camp_id')
            .references(`${CONSTS.CAMPS_TABLE_NAME}.id`);
          table.foreign('uploader_id')
            .references(`${CONSTS.USERS_TABLE_NAME}.user_id`);
      })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
      knex.schema.dropTable(CONSTS.CAMP_FILES_TABLE_NAME)
  ])
};
