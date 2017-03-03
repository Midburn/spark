var constants = require('../models/constants.js');
exports.up = function(knex, Promise) {
  return Promise.all([
      //volunteer departments
      knex.schema.createTable(constants.VOL_DEPARTMENTS, function(table) {
        table.increments();
        table.string('name_en'); 
        table.string('name_he');
      }),
      //roles in the department
      knex.schema.createTable(constants.VOL_DEPARTMENT_ROLES, function(table) {
        table.increments();
        table.string('name'); 
      }),
      //types in shift
      knex.schema.createTable(constants.VOL_TYPES_IN_SHIFT, function(table) {
        table.increments();
        table.string('name'); 
      }),
      //volunteers
      knex.schema.createTable(constants.VOLUNTEERS, function(table) {
        table.integer('user_id');
        table.integer('department_id'); 
        table.integer('event_id');
        table.integer('role_id');   
        table.integer('type_in_shift_id');
        table.boolean('is_prodcution');
        table.string('comment');
        table.timestamp('modified_date');
        //key
        table.primary(['user_id', 'department_id', 'event_id'])
        //references
        table.foreign('user_id').references('id').inTable(constants.USERS_TABLE_NAME);
        table.foreign('department_id').references('id').inTable(constants.VOL_DEPARTMENTS);
        table.foreign('role_id').references('id').inTable(constants.VOL_DEPARTMENT_ROLES);
        table.foreign('type_in_shift_id').references('id').inTable(constants.VOL_TYPES_IN_SHIFT);
      }),
      knex.schema.createTable(constants.VOL_SHIFTS, function(table) {
        table.increments();
        table.integer('department_id')
        table.string('location');
        table.integer('num_of_shift_managers'); 
        table.integer('num_of_volunteers'); 
        table.timestamp('start_time');
        table.timestamp('end_time');
        table.string('comment');
        table.timestamp('modified_date');
        //references
        table.foreign('department_id').references('id').inTable(constants.VOL_DEPARTMENTS);
      }),
      
      knex.schema.createTable(constants.VOL_SCHEDULE, function(table) {
          table.integer('user_id');
          table.integer('shift_id');
          table.boolean('attended');
          table.string('comment');
          //key
          table.primary(['user_id', 'shift_id'])
          //references
          table.foreign('user_id').references('user_id').inTable(constants.VOLUNTEERS);
          table.foreign('shift_id').references('id').inTable(constants.VOL_SHIFTS);

      }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all(
      [knex.schema.dropTable(constants.VOL_DEPARTMENTS)])
};
