exports.seed = function(knex, Promise) {
    return knex('camps').del()
    .then(() => {
        return knex('users').del();
    })
    .catch((error) => {
        log.error('Spark encountered an error while seeding and droping tables:');
        log.error(error);
    });
};