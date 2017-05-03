
exports.up = function(knex, Promise) {
    return Promise.all([
        knex('events').insert({event_id: "MIDBURN_2017"}),

        knex.schema.table('events', function (table) {
            table.string('name', 128);
            table.string('gate_code', 100);
        })
    ]);
};

exports.down = function(knex, Promise) {

};
