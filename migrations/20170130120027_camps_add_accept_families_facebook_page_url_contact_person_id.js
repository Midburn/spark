var constants = require('../models/constants.js');

exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table(constants.CAMPS_TABLE_NAME, function (table) {
            table.boolean("accept_families");
            table.string("facebook_page_url");
            table.integer("contact_person_id").unsigned();
            table.foreign('contact_person_id').references('users.user_id');
        })
    ]);
};

exports.down = function(knex, Promise) {

};
