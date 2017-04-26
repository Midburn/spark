var constants = require('../models/constants');
exports.up = function(knex, Promise) {
  return Promise.all([
      knex.schema.renameTable(constants.VOLUNTEERS_TABLE_NAME, constants.VOLUNTEERS_TABLE_NAME+'_delete')
  ]);
};

exports.down = function(knex, Promise) {
  
};
