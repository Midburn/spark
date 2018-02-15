const mocker = require('mocker-data-generator').default();
//
const EVENT_MOCK_SCHEMA = require('./mockSchema/events.schema');
const USER_MOCK_SCHEMA = require('./mockSchema/users.schema');
const CAMP_MOCK_SCHEMA = require('./mockSchema/camps.schema');
const Camp = require('../../models/camp').Camp;
const User = require('../../models/user').User;

const setLastIds = async () => {
    const lastUser = await User.forge().orderBy('user_id', 'ASC').fetch({columns: ['user_id']});
    const lastCamp = await Camp.forge().orderBy('id', 'ASC').fetch({columns: ['id']});
    USER_MOCK_SCHEMA.STRUCTURE.user_id.incrementalId = lastUser ? lastUser.user_id : 0;
    USER_MOCK_SCHEMA.STRUCTURE.user_id.incrementalId = lastCamp ? lastCamp.id : 0;
};

const generate = async (scale) => {
    if (scale > 30) {
        return Promise.reject('This scale is not yet supported');
    }
    const campCount = scale * 25;
    await setLastIds();
    return new Promise((resolve, reject) => {
        // TODO - Currently only create single event - need to think about increment with `MIDBURN` text.
        mocker
            .schema(EVENT_MOCK_SCHEMA.NAME, EVENT_MOCK_SCHEMA.STRUCTURE, scale * 2)
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
