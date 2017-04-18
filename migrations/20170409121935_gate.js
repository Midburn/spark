exports.up = function (knex, Promise) {
    return Promise.all([

        // Tickets table
        knex.schema.createTable('tickets', function (table) {
            table.timestamps();

            table.increments('ticket_id').primary();
            table.integer('ticket_number').comment('The number that is presented to the user');
            table.string('event_id', 32).notNullable();
            table.foreign('event_id').references('events.event_id');
            table.integer('buyer_id');
            table.foreign('buyer_id').references('users.user_id');
            table.integer('holder_id');
            table.foreign('holder_id').references('users.user_id');
            table.string('barcode', 32).unique().notNullable();
            table.string('type', 128);
            table.dateTime('entrance_timestamp');
            //table.foreign('order_id').references('orders.order_id');
            table.integer('order_id');
            table.unique(['ticket_number', 'event_id']);
        }),

        // Ticket Pools table
        knex.schema.createTable('ticket_pools', function (table) {
            table.timestamps();

            table.increments('pool_id').primary();
            table.integer('quota').defaultTo(0);
        }),

        // Attendances table
        knex.schema.createTable('attendances', function (table) {
            table.timestamps();
            table.integer('ticket_id').notNullable();
            table.integer('ticket_pool');
            table.foreign('ticket_id').references('ticket.ticket_id');
            table.foreign('ticket_pool').references('ticket_pools.pool_id');
            table.dateTime('entrance_timestamp');
            table.dateTime('exit_timestamp');
        })

    ]);
};

exports.down = function (knex, Promise) {

};
