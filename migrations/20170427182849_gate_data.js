exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.table('events', function (table) {
            table.string('name', 128);
            table.string('gate_code', 100);
        }),

        knex.schema.table('tickets', function (table) {
            table.dropForeign('event_id');
            table.dropColumn('event_id');
        }),

        knex('events').insert({
            event_id: "MIDBURN_2017",
            gate_code: "171819",
            name: "Midburn 2017 מידברן"
        }),

        knex.schema.table('attendances', function (table) {
            table.dropForeign('ticket_pool');
            table.integer('ticket_pool_id').unsigned();
            table.foreign('ticket_pool_id').references('ticket_pools.pool_id');
        })
    ]);
};

exports.down = function (knex, Promise) {

};
