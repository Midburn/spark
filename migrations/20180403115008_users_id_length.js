exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.alterTable('users', t => {
            t.string('israeli_id', 20).alter();
        }),
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.alterTable('users', t => {
            t.string('israeli_id', 9).alter();
        }),
    ]);
};
