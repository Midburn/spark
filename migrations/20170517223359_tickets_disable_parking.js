exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('tickets', function(table) {
            table.boolean('disabledParking').defaultTo(false);
        }
    ]);};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('tickets', function(table) {
            table.dropColumn('disabledParking');
        }
    ]);};
