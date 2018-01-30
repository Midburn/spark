const mocker = require('mocker-data-generator').default();
//
const EVENT_MOCK_SCHEMA = require('./mockSchema/events.schema');
const USER_MOCK_SCHEMA = require('./mockSchema/users.schema');
const CAMP_MOCK_SCHEMA = require('./mockSchema/camps.schema');

const generate = (scale) => {
    if (scale > 30) {
        return Promise.reject('This scale is not yet supported');
    }
    const campCount = scale * 25;
    return new Promise((resolve, reject) => {
        // TODO - Currently only create single event - need to think about increment with `MIDBURN` text.
        mocker
            .schema(EVENT_MOCK_SCHEMA.NAME, EVENT_MOCK_SCHEMA.STRUCTURE, 1)
            .schema(USER_MOCK_SCHEMA.NAME, USER_MOCK_SCHEMA.STRUCTURE, campCount * 25)
            .schema(CAMP_MOCK_SCHEMA.NAME, CAMP_MOCK_SCHEMA.STRUCTURE, campCount)
            .build((err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            })
    });

};

module.exports = generate;
