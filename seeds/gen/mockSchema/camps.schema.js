const EVENT_MOCK_SCHEMA = require('./events.schema');
const USER_MOCK_SCHEMA = require('./users.schema');
const constants = require('../../../models/constants');

/*
See https://github.com/danibram/mocker-data-generator for data-types and usage.
 */
const CAMP_MOCK_SCHEMA = {
    NAME: 'camp',
    STRUCTURE: {
        id: {
            incrementalId: 0
        },
        created_at: {
            faker: 'date.past'
        },
        updated_at: {
            faker: 'date.past'
        },
        event_id: {
            hasOne: EVENT_MOCK_SCHEMA.NAME,
            get: EVENT_MOCK_SCHEMA.PK //this populate the field with one id of a random event
        },
        __prototype: {
            values: constants.CAMP_PROTOTYPE
        },
        camp_name_he: {
            function:  function () {
                return this.faker.lorem.sentence().slice(0, 49);
            }
        },
        camp_name_en:{
            function:  function () {
                return this.faker.lorem.sentence().slice(0, 49);
            }
        },
        camp_desc_he: {
            faker: 'lorem.sentence'
        },
        camp_desc_en: {
            faker: 'lorem.sentence'
        },
        type: {
            values: constants.CAMP_TYPES
        },
        status: {
            values: constants.CAMP_STATUSES
        },
        web_published: {
            faker: 'random.boolean'
        },
        camp_activity_time: {
            values: constants.CAMP_ACTIVITY_TIMES
        },
        child_friendly: {
            faker: 'random.boolean'
        },
        noise_level: {
            values: constants.CAMP_NOISE_LEVELS
        },
        public_activity_area_sqm: {
            faker: 'random.number'
        },
        public_activity_area_desc: {
            faker: 'lorem.sentence'
        },
        support_art: {
            faker: 'random.boolean'
        },
        location_comments: {
            faker: 'lorem.sentence'
        },
        camp_location_street: {
            faker: 'lorem.sentence'
        },
        camp_location_street_time: {
            faker: 'lorem.sentence'
        },
        camp_location_area: {
            faker: 'lorem.sentence'
        },
        // addinfo_json: {},
        main_contact: {
            hasOne: USER_MOCK_SCHEMA.NAME,
            get: USER_MOCK_SCHEMA.PK //this populate the field with one id of a random user
        },
        moop_contact: {
            hasOne: USER_MOCK_SCHEMA.NAME,
            get: USER_MOCK_SCHEMA.PK //this populate the field with one id of a random user
        },
        safety_contact: {
            hasOne: USER_MOCK_SCHEMA.NAME,
            get: USER_MOCK_SCHEMA.PK //this populate the field with one id of a random user
        },
        accept_families: {
            faker: 'random.boolean'
        },
        facebook_page_url: {
            faker: 'internet.url'
        },
        contact_person_phone: {
            function: function() {
                const mainId = this.object.main_contact;
                return this.db.user[mainId].cell_phone
            }
        },
        contact_person_email: {
            function: function() {
                const mainId = this.object.main_contact;
                return this.db.user[mainId].email
            }
        },
        contact_person_id: {
            hasOne: USER_MOCK_SCHEMA.NAME,
            get: USER_MOCK_SCHEMA.PK
        },
        // pre_sale_tickets_quota: {}
    }
};

module.exports = CAMP_MOCK_SCHEMA;
