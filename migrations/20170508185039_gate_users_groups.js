exports.up = function (knex, Promise) {
    return Promise.all([

        knex.schema

            .dropTable('tickets_in_ticket_pools')
            .dropTable('ticket_pools')

            .createTable('users_groups', table => {
                table.timestamps();

                table.integer('group_id').unsigned().notNullable();
                table.string('event_id', 15);
                table.string('type', 32);
                table.string('name', 128);
                table.integer('entrance_quota').unsigned();

                table.primary('group_id');
            })

            .table('users_groups', table => {
                table.foreign('event_id').references('events.event_id');
            })

            .createTable('users_groups_membership', table => {
                table.timestamps();
                table.integer('group_id').unsigned().notNullable();
                table.integer('user_id').unsigned().notNullable();
                table.primary(['group_id', 'user_id']);
            })

            .table('users_groups_membership', table => {
                table.foreign('group_id').references('users_groups.group_id');
                table.foreign('user_id').references('users.user_id');
            })

            .table('tickets', table => {
                table.dateTime('entrance_timestamp');
                table.dateTime('last_exit_timestamp');
                table.integer('entrance_group_id').unsigned();
            })

            .table('tickets', table => {
                table.foreign('entrance_group_id').references('users_groups.group_id');
            })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('users_groups_membership'),
        knex.schema.dropTable('users_groups')
    ]);
};

