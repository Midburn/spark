
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('payments', function (table) {
            table.foreign('user_id').references('users.user_id');
        }),
        knex.schema.table('npo_members', function (table) {
            table.foreign('user_id', 'users.user_id');
        }),
        knex.schema.table('camps', function (table) {
            table.foreign('main_contact').references('users.user_id');
            table.foreign('moop_contact').references('users.user_id');
            table.foreign('safety_contact').references('users.user_id');
        }),
        knex.schema.table('camp_details', function (table) {
            table.foreign('camp_id').references('camps.id');
        }),
        knex.schema.table('users', function (table) {
            table.foreign('camp_id').references('camps.id');
        })
    ]);
};

exports.down = function(knex, Promise) {
  
};
