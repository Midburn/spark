
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw('ALTER TABLE suppliers MODIFY main_contact_phone_number VARCHAR(16)'),
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.raw('ALTER TABLE suppliers MODIFY main_contact_phone_number INT;'),
    ]);
};
