const mocker = require('mocker-data-generator').default(),
    EVENT_MOCK_SCHEMA = require('./mockSchema/events.schema'),
    USER_MOCK_SCHEMA = require('./mockSchema/users.schema'),
    CAMP_MOCK_SCHEMA = require('./mockSchema/camps.schema'),
    SUPPLIER_MOCK_SCHEMA = require('./mockSchema/suppliers.schema'),
    utils = require('../util/utils');

const generate = async (scale) => {
    if (scale > 30) {
        return Promise.reject('This scale is not yet supported');
    }
    const campCount = scale * 50;
    return new Promise(async (resolve, reject) => {
        // TODO - Currently only create single event - need to think about increment with `MIDBURN` text.
        await utils.preventPkErrors([EVENT_MOCK_SCHEMA, USER_MOCK_SCHEMA, CAMP_MOCK_SCHEMA, SUPPLIER_MOCK_SCHEMA]);
        mocker
            .schema(EVENT_MOCK_SCHEMA.NAME, EVENT_MOCK_SCHEMA.STRUCTURE, scale * 2)
            .schema(USER_MOCK_SCHEMA.NAME, USER_MOCK_SCHEMA.STRUCTURE, campCount * 3)
            .schema(CAMP_MOCK_SCHEMA.NAME, CAMP_MOCK_SCHEMA.STRUCTURE, campCount)
            .schema(SUPPLIER_MOCK_SCHEMA.NAME, SUPPLIER_MOCK_SCHEMA.STRUCTURE, campCount)
            .build((err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            })
    });

};

module.exports = generate;
