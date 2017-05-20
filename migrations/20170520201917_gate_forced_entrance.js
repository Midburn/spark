exports.up = function (knex, Promise) {
    return Promise.all([

        knex.raw("update events set gate_status='early_arrival'"),

        knex.schema.table("tickets", table => {
            table.boolean("forced_entrance").defaultTo(false);
            table.string("forced_entrance_reason", 256);
        })
    ])
};

exports.down = function (knex, Promise) {

};
