exports.up = function (knex, Promise) {
    return Promise.all([

        knex.schema.table("events", table => {
            table.string("gate_status", 16);
        }).then(knex.raw("update events set gate_status='early_arrival'")),

        knex.schema.table("tickets", table => {
            table.boolean("forced_entrance").defaultTo(false);
            table.string("forced_entrance_reason", 256);
        })
    ])
};

exports.down = function (knex, Promise) {

};
