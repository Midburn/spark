const log = require('../libs/logger')(module);
const Event = require('../models/event').Event;

const addEventsToDb = (events) => {
    log.info('Creating event...');
    return Promise.all(events.map(saveEvent))
        .catch(err => {
            log.error(`An error occurred while saveing events - ${err}`);
        });
};

function saveEvent(event) {
    return new Event(event).save(null, {method: 'insert'});
}
module.exports = addEventsToDb;
