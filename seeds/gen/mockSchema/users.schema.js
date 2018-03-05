const User = require('../../../models/user').User;
/*
See https://github.com/danibram/mocker-data-generator for data-types and usage.
 */
const USER_MOCK_SCHEMA = {
    PK: 'user_id',
    NAME: 'user',
    MODEL: User,
    STRUCTURE: {
        id: {
            virtual: true,
            incrementalId: 1
        },
        user_id: {
            function: function () {
                return this.object.id;
            }
        },
        created_at : {
            faker: 'date.past'
        },
        updated_at : {
            faker: 'date.past'
        },
        email : {
            function: function() {
                if (this.object.user_id === 1) {
                    return 'a'
                }
                if (this.object.user_id === 2) {
                    return 'b'
                }
                if (this.object.user_id === 3) {
                    return 'c'
                }
                return this.faker.internet.email();
            }
        },
        password : {
            static: 'a'
        },
        enabled : {
            function: function() {
                if (this.object.user_id === 1 ||
                    this.object.user_id === 2 ||
                    this.object.user_id === 3) {
                    return true;
                }
                return this.faker.random.boolean();
            }
        },
        validated : {
            function: function() {
                if (this.object.user_id === 1 ||
                    this.object.user_id === 2 ||
                    this.object.user_id === 3) {
                    return true;
                }
                return this.faker.random.boolean();
            }
        },
        random_role : {
            values: ['admin', 'camp_manager', ''],
            virtual: true
        },
        roles : {
            function: function() {
                if (this.object.user_id === 1) {
                    return 'admin';
                }
                if (this.object.user_id === 2) {
                    return 'camp_manager';
                }
                if (this.object.user_id === 3) {
                    return '';
                }
                return this.object.random_role;
            }
        },
        first_name : {
            function: function() {
                if (this.object.user_id === 1) {
                    return 'Admin';
                }
                if (this.object.user_id === 2) {
                    return 'Camp';
                }
                if (this.object.user_id === 3) {
                    return 'Normal';
                }
                return this.faker.name.firstName();
            }
        },
        last_name : {
            function: function() {
                if (this.object.user_id === 1) {
                    return 'McAdmin';
                }
                if (this.object.user_id === 2) {
                    return 'Manager';
                }
                if (this.object.user_id === 3) {
                    return 'User';
                }
                return this.faker.name.lastName();
            }
        },
        name : {
            function: function() {
                return `${this.object.first_name} ${this.object.last_name}`;
            }
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
