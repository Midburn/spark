
exports.up = function(knex, Promise) {
    return Promise.all([
        knex('events').insert({event_id: "MIDBURN_2017"})
    ]);
};

exports.down = function(knex, Promise) {

};
