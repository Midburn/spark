
exports.up = function(knex, Promise) {

    // Suppliers table
    knex.schema.createTable(constants.SUPPLIERS_COMMENTS_TABLE, function(table) {
        table.timestamps();

        table.string('supplier_id', 9)
        table.integer('user_id').unsigned();
        table.text('comment', 'largetext');

        table.foreign('supplier_id').references('supplier_id').inTable(constants.SUPPLIERS_TABLE_NAME);
        table.foreign('user_id').references('user_id').inTable(constants.USERS_TABLE_NAME);
    })
};

exports.down = function(knex, Promise) {
    knex.schema.dropTable(constants.SUPPLIERS_COMMENTS_TABLE)
};
