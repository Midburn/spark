exports.up = function(knex, Promise) {
    return Promise.all([knex.schema.alterTable('tickets', function(table) {
            table.boolean('disabledParking').defaultTo(false);
        })])
};

exports.down = function(knex, Promise) {
    return Promise.all([knex.schema.alterTable('tickets', function(table) {
            table.dropColumn('disabledParking');
        })])
};
