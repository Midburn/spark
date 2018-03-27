var _ = require('lodash');


exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('events', function (table) {
            table.datetime('created_at');
        }),

        // Data migration:
        knex.select().from('events').then(function (events) {
            _.each(events, event => {
                let addinfo = JSON.parse(event.addinfo_json);
                if (addinfo && addinfo.created_at) {
                    let created_at = new Date(addinfo.created_at);
                    knex('events').where('event_id', '=', event.event_id).update('created_at', created_at).then();
                }
             });
        }),
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('events', function (table) {
            table.dropColumns('created_at');
        }),
    ]);
};
