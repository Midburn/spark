const mocker = require('mocker-data-generator').default()
//
const EVENT_MOCK_SCHEMA = require('./mockSchema/events.schema');
const USER_MOCK_SCHEMA = require('./mockSchema/users.schema');
const CAMP_MOCK_SCHEMA = require('./mockSchema/camps.schema');

const generate = (scale) => {
    const campCount = scale * 25;
    mocker
        .schema(EVENT_MOCK_SCHEMA.NAME, EVENT_MOCK_SCHEMA.STRUCTURE, Math.ceil(scale / 200))
        .schema(USER_MOCK_SCHEMA.NAME, USER_MOCK_SCHEMA.STRUCTURE, campCount * 25)
        .schema(CAMP_MOCK_SCHEMA.NAME, CAMP_MOCK_SCHEMA.STRUCTURE, campCount)
        .build((err, data) => {
            if (err) {
                return console.log(err);
            }
            console.log(data);
        })
};

module.exports = generate;
