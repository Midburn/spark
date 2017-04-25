exports.up = function (knex, Promise) {
    return Promise.all([

        knex.schema.table('npo_members', function (table) {
            table.integer('member_number').unsigned();
            table.binary('document_image');
            table.text('application_data');
            table.integer('application_reviewer_id').unsigned();
        }),

        knex.schema.table('npo_members', function (table) {
            table.foreign('application_reviewer_id').references('users.user_id');
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([

        knex.schema.table('npo_members', function (table) {
            table.dropForeign('application_reviewer_id');
            table.dropColumn('member_number');
            table.dropColumn('document_image');
            table.dropColumn('application_data');
            table.dropColumn('application_reviewer_id');
        })
    ]);
};
