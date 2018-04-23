const Suppliers = require('../../../models/suppliers').Suppliers;
const constants = require('../../../models/constants');

/*
See https://github.com/danibram/mocker-data-generator for data-types and usage.
 */

var fakeText = function () {
    return this.faker.lorem.sentence().slice(0, 20);
}

const SUPPLIER_MOCK_SCHEMA = {
    NAME: 'supplier',
    PK: 'supplier_id',
    MODEL: Suppliers,
    STRUCTURE: {
        id: {
            virtual: 1,
            incrementalId: 1,
        },
        supplier_id: {
            incrementalId: 1,
        },
        created_at: {
            faker: 'date.past',
        },
        updated_at: {
            faker: 'date.past',
        },

        supplier_name_en: {function: fakeText},
        supplier_name_he: {function: fakeText},

        main_contact_name: {
            faker: 'name.firstName',
        },
        main_contact_position: {
            faker: 'name.jobTitle',
        },
        main_contact_phone_number: {
            faker: 'random.number'
            // TODO: should be string, not integer, fix later. see  #832
        },
        supplier_category: {
            values: constants.SUPPLIER_CATEGORIES,
        },

        supplier_website_link: {
            faker: 'internet.url',
        },

        supplier_midmarket_link: {
            faker: 'internet.url',
        },
    }
};

module.exports = SUPPLIER_MOCK_SCHEMA;
