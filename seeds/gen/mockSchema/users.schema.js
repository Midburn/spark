/*
See https://github.com/danibram/mocker-data-generator for data-types and usage.
 */
const USER_MOCK_SCHEMA = {
    PK: 'user_id',
    NAME: 'user',
    STRUCTURE: {
        user_id: {
            incrementalId: 0
        },
        created_at : {
            faker: 'date.past'
        },
        updated_at : {
            faker: 'date.past'
        },
        // Leave name as null for now
        // name : {
        //     faker:
        // },
        email : {
            faker: 'internet.email'
        },
        password : {
            faker: 'internet.password'
        },
        enabled : {
            faker: 'random.boolean'
        },
        validated : {
            faker: 'random.boolean'
        },
        roles : {
            values: ['admin', 'camp_manager', '']
        },
        first_name : {
            faker: 'name.firstName'
        },
        last_name : {
            faker: 'name.lastName'
        },
        gender : {
            values: ['male', 'female', 'other']
        },
        date_of_birth : {
            faker: 'date.past'
        },
        israeli_id : {
            faker: 'random.number'
        },
        address : {
            function: function() {
                return `${this.faker.address.streetAddress()} ${this.faker.address.city()}`

            }
        },
        cell_phone : {
            function: function () {
                // TODO - find a better method for israeli type phones (with correct char limit)
                return this.faker.phone.phoneNumber().slice(0, 15);
            }
        },
        extra_phone : {
            function: function () {
                // TODO - find a better method for israeli type phones (with correct char limit)
                return this.faker.phone.phoneNumber().slice(0, 10);
            }
        },
        npo_member : {
            faker: 'random.boolean'
        },
        // Currently set as null
        // facebook_id : {
        //     faker:
        // },
        // facebook_token : {
        //     faker:
        // },
        // current_event_id : {
        //     faker:
        // },
        // current_status : {
        //     faker:
        // },
        current_event_id_ticket_count : {
            faker: 'random.number'
        }
    }
};

module.exports = USER_MOCK_SCHEMA;
