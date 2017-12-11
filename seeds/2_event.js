const log = require('../libs/logger')(module),
events = require('./dev/events')

exports.seed = (knex, Promise) => {
    log.info('Creating event...')

    events.forEach(async event => {
        await knex('events').insert(event)
    });
}
