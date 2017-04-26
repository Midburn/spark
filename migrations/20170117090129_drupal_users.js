var constants = require('../models/constants.js');

exports.up = function(knex, Promise) {
    return Promise.all([
        // this table might be created and filled with data from an external process
        // that's why we use createTableIfNotExists - to allow for the option that the table already exists
        knex.schema.createTableIfNotExists(constants.DRUPAL_USERS_TABLE_NAME, function (table) {
            table.string('name', 60); // Unique user name.
            table.string('pass', 128); // User’s password (hashed)
            table.integer('status').unsigned(); // Whether the user is active(1) or blocked(0).
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable(constants.DRUPAL_USERS_TABLE_NAME)
    ])

};
