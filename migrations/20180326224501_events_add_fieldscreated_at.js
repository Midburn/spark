var _ = require('lodash');

exports.up = function(knex, Promise) {
    // Take out `created_at`, `start_date`, `end_date` from `addinfo_json` field

    return Promise.all([
        knex.schema.table('events', function (table) {
            table.datetime('created_at');
            table.datetime('start_date');
            table.datetime('end_date');
        }),

        // Data migration:
        knex.select().from('events').then(function (events) {
            _.each(events, event => {
                let addinfo = JSON.parse(event.addinfo_json);
                if (addinfo) {
                    if (addinfo.created_at) {
                        let created_at = new Date(addinfo.created_at);
                        knex('events').where('event_id', '=', event.event_id).update('created_at', created_at).then();
                    }
                    if (addinfo.start_date) {
                        let start_date = new Date(addinfo.start_date);
                        knex('events').where('event_id', '=', event.event_id).update('start_date', start_date).then();
                    }
                    if (addinfo.end_date) {
                        let end_date = new Date(addinfo.end_date);
                        knex('events').where('event_id', '=', event.event_id).update('end_date', end_date).then();
                    }
                }
             });
        }),
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('events', function (table) {
            table.dropColumns('created_at');
            table.dropColumns('start_date');
            table.dropColumns('end_date');
        }),
    ]);
};
