exports.up = function (knex, Promise) {
    return Promise.all([

        // Tickets table
        knex.schema.createTableIfNotExists('tickets', function (table) {
            table.timestamps();

            table.increments('ticket_id').primary();
            table.integer('ticket_number').comment('The number that is presented to the user');
            table.string('event_id', 32).notNullable();
            table.integer('buyer_id').unsigned();
            table.integer('holder_id').unsigned();
            table.string('barcode', 32).unique().notNullable();
            table.string('type', 128);
            table.dateTime('entrance_timestamp');
            //table.foreign('order_id').references('orders.order_id');
            table.integer('order_id');
            table.unique(['ticket_number', 'event_id']);
        }),

        knex.schema.table('tickets', function (table) {
            table.foreign('event_id').references('events.event_id');
            table.foreign('buyer_id').references('users.user_id');
            table.foreign('holder_id').references('users.user_id');
        }),

        // Ticket Pools table
        knex.schema.createTableIfNotExists('ticket_pools', function (table) {
            table.timestamps();

            table.increments('pool_id').primary();
            table.integer('quota').defaultTo(0);
        }),

        // Attendances table
        knex.schema.createTableIfNotExists('attendances', function (table) {
            table.timestamps();
            table.integer('ticket_id').unsigned().notNullable();
            table.integer('ticket_pool').unsigned();
            table.foreign('ticket_id').references('tickets.ticket_id');
            table.foreign('ticket_pool').references('ticket_pools.pool_id');
            table.dateTime('entrance_timestamp');
            table.dateTime('exit_timestamp');
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('attendances'),
        knex.schema.dropTable('ticket_pools'),
        knex.schema.dropTable('tickets')
    ])
};
