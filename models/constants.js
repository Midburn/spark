var get_default_enum = function (enu) {
    return enu.find(function (e) {
        return e.default;
    }).id;
};

var get_enum = function (enu) {
    return enu.map(function (e) {
        return e.id;
    })
};

var user_genders = [
    {id: 'male'},
    {id: 'female'},
    {id: 'other', default: true}
];

var npo_membership_statuses = [
    {id: 'not_member', default: true},
    {id: 'request_approved'},
    {id: 'member_paid'},
    {id: 'member_should_pay'},
    {id: 'banned'},
    {id: 'request_rejected'},
    {id: 'applied_for_membership'}
];

var gate_status = [
    {id: 'regular', default: true},
    {id: 'early_arrival'}
];

const prototype_camps = {
    THEME_CAMP: {
        id: 'theme_camp',
        name: 'Theme Camps',
        multiple_groups_for_user: false,
        allow_new_users: true,
        send_mail: true,
        auto_approve_new_members: false,
        require_group_status_open_closed: true,
    },
    ART_INSTALLATION: {
        id: 'art_installation',
        name: 'Art Installation',
        multiple_groups_for_user: true,
        allow_new_users: false,
        send_mail: false,
        auto_approve_new_members: true,
    },
    PROD_DEP: {
        id: 'prod_dep',
        name: 'Production Department',
        multiple_groups_for_user: true,
        send_mail: false,
        auto_approve_new_members: true,
        allow_new_users: false,
    },
    by_prototype: function (prototype) {
        for (let key in this) {
            if (typeof (this[key]) === 'object' && this[key].id === prototype) {
                return this[key];
            }
        }
    }
};

const ticketType = {
    MIDBURN2017_SUPPORT_TICKET: '39',
    MIDBURN2017_ADULT_TICKET: '40',
    MIDBURN2017_CHILD_TICKET: '41',
    MIDBURN2017_ADULT_DIRECT_SALE_TICKET: '43',
    MIDBURN2017_YOUTH_TICKET: '44',
    MIDBURN2017_LOW_INCOME_TICKET: '45',
    INTERNATIONAL_DIRECT_SALE: '46',
    SANDBOX2018_ADULT_TICKET: '49',
    SANDBOX2018_TICKET_A: '50',
    SANDBOX2018_TICKET_B: '51',
    SANDBOX2018_TICKET_C: '52',
    MIDBURN2018_SUPPORT_TICKET: '53',
    MIDBURN2018_ADULT_TICKET: '54',
    MIDBURN2018_CHILD_TICKET: '55',
    MIDBURN2018_ADULT_DIRECT_SALE_TICKET: '56',
    MIDBURN2018_YOUTH_TICKET: '57',
    MIDBURN2018_LOW_INCOME_TICKET: '58',
};

// TODO We should not use enums like this at all!! Add ticket_types table to DB
// TODO This object should be loaded from db for all events
const events = {
    MIDBURN2017: {
        bundles: [
            ticketType.MIDBURN2017_SUPPORT_TICKET,
            ticketType.MIDBURN2017_ADULT_TICKET,
            ticketType.MIDBURN2017_CHILD_TICKET,
            ticketType.MIDBURN2017_ADULT_DIRECT_SALE_TICKET,
            ticketType.MIDBURN2017_YOUTH_TICKET,
            ticketType.MIDBURN2017_LOW_INCOME_TICKET,
            ticketType.MIDBURN2017_INTERNATIONAL_DIRECT_SALE
        ]
    },
    SANDBOX2017: {
        bundles: [
            ticketType.SANDBOX2017_ADULT_TICKET,
            ticketType.SANDBOX2017_TICKET_A,
            ticketType.SANDBOX2017_TICKET_B,
            ticketType.SANDBOX2017_TICKET_C
        ]
    },
    'MIDBURN2018': {
        bundles: [
            ticketType.SUPPORT_TICKET,
            ticketType.ADULT_TICKET,
            ticketType.CHILD_TICKET,
            ticketType.ADULT_DIRECT_SALE_TICKET,
            ticketType.YOUTH_TICKET,
            ticketType.LOW_INCOME_TICKET,
            ticketType.INTERNATIONAL_DIRECT_SALE
        ]
    }
};

module.exports = {

    // -- system constant --
    // note: Future release will change the event_id
    // TODO We should not use this constant. We need to implement a mechanism that will allow the user to change the current event from the UI, therefore we can't rely on constant!
    DEFAULT_EVENT_ID: 'MIDBURN2017',

    //TODO move this to jsoninfo inside events table
    //TODO also fix event.js method to extract the data
    //currently the method first returns the constants if exists and only if not it will search the DB
    PRESALE_TICKETS_START_DATE: "2018-01-06",
    PRESALE_TICKETS_END_DATE: "2018-01-11 18:00:00",
    events,

    // -- table names --
    EVENTS_TABLE_NAME: 'events',
    USERS_TABLE_NAME: 'users',
    PAYMENTS_TABLE_NAME: 'payments',
    NPO_MEMBERS_TABLE_NAME: 'npo_members',
    CAMPS_TABLE_NAME: 'camps',
    CAMP_MEMBERS_TABLE_NAME: 'camp_members',
    DRUPAL_USERS_TABLE_NAME: 'drupal_users',
    TICKETS_TABLE_NAME: 'tickets',
    CAMP_FILES_TABLE_NAME: 'camps_files',

    prototype_camps: prototype_camps,

    VOL_DEPARTMENTS_TABLE_NAME: 'vol_departments',
    VOLUNTEERS_TABLE_NAME: 'volunteers',
    VOL_DEPARTMENT_ROLES_TABLE_NAME: 'vol_departments_roles',
    VOL_TYPES_IN_SHIFT_TABLE_NAME: 'vol_types_in_shift',
    VOL_SHIFTS_TABLE_NAME: 'vol_shifts',
    VOL_SCHEDULE_TABLE_NAME: 'vol_schedule',

    // -- enums --

    USER_GENDERS: get_enum(user_genders),
    USER_GENDERS_DEFAULT: get_default_enum(user_genders),

    /**
     * User Current Status:
     *      define the position of the profile. in which event user is,
     *      and if they are in the event and out the event.
     *      use the addedinfo_json status change log, to see upon any change.
     */
    USER_CURRENT_STATUS: ['in event', 'out event'],

    NPO_MEMBERSHIP_STATUSES: get_enum(npo_membership_statuses),
    NPO_MEMBERSHIP_STATUSES_DEFAULT: get_default_enum(npo_membership_statuses),

    /**
     * The prototype describes the camp types.
     *    camps - regular camps
     *    art_installation - art_installation
     */
    CAMP_PROTOTYPE: [prototype_camps.THEME_CAMP.id, prototype_camps.ART_INSTALLATION.id, prototype_camps.PROD_DEP.id],

    CAMP_STATUSES: ['deleted', 'open', 'closed', 'inactive'],

    CAMP_ACTIVITY_TIMES: ['morning', 'noon', 'evening', 'night'],

    CAMP_NOISE_LEVELS: ['quiet', 'medium', 'noisy', 'very noisy'],

    CAMP_TYPES: ['food', 'drinking/bar', 'music', 'workshops', 'art-supporting', 'other'],

    /**
     * Camp Member Status:
     *      pending - a camp member requested to join camp, waiting for camp manager to approve.
     *      pending_mgr - a camp manager request to add member, waiting for member to approve.
     *      approved - a member is approved as a member
     *      rejected - a member rejected from camp. reject reason will be on addedinfo_json.last_rejected_reason
     *      approved_mgr - a member is approved as a member, and has manager rights to camp.
     *      supplier - member is supplier, for the supplier notification later.
     */
    CAMP_MEMBER_STATUS: ['approved', 'pending', 'pending_mgr', 'rejected', 'approved_mgr', 'supplier', 'deleted'],

    EVENT_GATE_STATUS: get_enum(gate_status),

    // This is a list of URLs the login process is allowed to redirect to.
    // This is to make sure users are not sent spark links via e.g. email by a malicious 3rd party
    // and are redirected to the senders desired location, e.g. can be used for phishing.
    // If we redirect to a new URL from login, we will need to add it here.
    LOGIN_REDIRECT_URL_WHITELIST: ['/', '/admin'],

};
