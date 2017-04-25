exports.up = function (knex, Promise) {
    return Promise.all([

        knex.schema.alterTable('npo_members', function (table) {
            table.integer('member_number').unsigned();
            table.binary('document_image');
            table.text('application_data');
            table.integer('application_reviewer_id').unsigned();
        }),

        knex.schema.alterTable('npo_members', function (table) {
            table.foreign('application_reviewer_id').references('users.user_id');
        })
    ]);
};

exports.down = function (knex, Promise) {

};
