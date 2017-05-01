exports.up = function (knex, Promise) {
    return Promise.all([

        knex.schema.table('camp_members', function (table) {
            //table.dropForeign('camp_id');
        }),

        knex.schema.table('users', function (table) {
            table.string('cell_phone', 16).alter();
            table.timestamp('email_validation_expires').nullable().alter();
            table.timestamp('current_last_status').nullable().alter();
        })
    ]);
};

exports.down = function (knex, Promise) {

};
