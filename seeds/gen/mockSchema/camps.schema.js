const EVENT_MOCK_SCHEMA = require('./events.schema'),
    USER_MOCK_SCHEMA = require('./users.schema'),
    constants = require('../../../models/constants'),
    Camp = require('../../../models/camp').Camp;

/*
See https://github.com/danibram/mocker-data-generator for data-types and usage.
 */
const CAMP_MOCK_SCHEMA = {
    NAME: 'camp',
    PK: 'id',
    MODEL: Camp,
    STRUCTURE: {
        id: {
            incrementalId: 1
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
            values: constants.CAMP_PROTOTYPE.filter(p => p !== 'prod_dep')
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
            function:  function () {
                return this.faker.lorem.sentence().slice(0, 49);
            }
        },
        camp_desc_en: {
            function:  function () {
                return this.faker.lorem.sentence().slice(0, 49);
            }
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
        camp_contact: {
            // This is used to keep same contact as main contact
            hasOne: USER_MOCK_SCHEMA.NAME,
            get: USER_MOCK_SCHEMA.PK,
            virtual: true
        },
        // addinfo_json: {},
        main_contact: {
            function: function() {
                return this.object.camp_contact;
            }
        },
        moop_contact: {
            function: function() {
                return this.object.camp_contact;
            }
        },
        safety_contact: {
            function: function() {
                return this.object.camp_contact;
            }
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
                const user = this.db.user.find(user => user.user_id === mainId);
                return user.cell_phone
            }
        },
        contact_person_email: {
            function: function() {
                const mainId = this.object.main_contact;
                const user = this.db.user.find(user => user.user_id === mainId);
                return user.email
            }
        },
        contact_person_id: {
            function: function() {
                return this.object.camp_contact;
            }
        }
    }
};

module.exports = CAMP_MOCK_SCHEMA;
