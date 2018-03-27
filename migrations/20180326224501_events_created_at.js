
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('events', function (table) {
            table.datetime('created_at');
        }),
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('events', function (table) {
            table.dropColumns('created_at');
        }),
    ]);
};
