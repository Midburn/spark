
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('tickets', t => {
        t.string('barcode', 32).nullable().alter()
    })
  ])
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.alterTable('tickets', t => {
            t.string('barcode', 32).notNullable().alter()
        })
      ])
};
