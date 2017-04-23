exports.up = function (knex, Promise) {
    return Promise.all([

        // Tickets table
        knex.schema.alterTable('npo_members', function (table) {
            table.integer('member_number');
            table.binary('document_image');
            table.string('application_data');
        })
    ]);
};

exports.down = function (knex, Promise) {

};
