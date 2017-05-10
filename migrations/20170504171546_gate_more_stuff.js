exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.table('tickets', function (table) {
            table.string('event_id', 15).notNullable();
            table.foreign('event_id').references('events.event_id');

            table.dropUnique(['ticket_number', 'event_id']);
            table.unique(['event_id', 'ticket_number']);

            table.renameColumn('entrance_timestamp', 'first_entrance_timestamp');
            table.boolean('inside_event').notNullable().defaultsTo(false);
        }),

        knex.schema.table('ticket_pools', function (table) {
            table.renameColumn('quota', 'entrance_quota');
            table.string('name', 128);
        }),

        knex.schema.dropTable('attendances'),

        // Many-to-many association table
        knex.schema.createTable('tickets_in_ticket_pools', function (table) {
            table.timestamps();
            table.integer('ticket_id').unsigned().notNullable();
            table.integer('pool_id').unsigned().notNullable();
            table.dateTime('entrance_timestamp');
            table.dateTime('exit_timestamp');
            table.primary(['pool_id', 'ticket_id']);
        }),

        knex.schema.table('tickets_in_ticket_pools', function (table) {
            table.foreign('ticket_id').references('tickets.ticket_id');
            table.foreign('pool_id').references('ticket_pools.pool_id');
        })
    ]);
};

exports.down = function (knex, Promise) {

};
