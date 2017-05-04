exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.table('tickets', function (table) {
            table.string('event_id', 15).notNullable();
            table.foreign('event_id').references('events.event_id');

            table.dropUnique(['ticket_number', 'event_id']);
            table.unique(['event_id', 'ticket_number']);
        })
    ]);
};

exports.down = function (knex, Promise) {

};
