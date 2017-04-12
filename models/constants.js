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
    { id: 'male' },
    { id: 'female' },
    { id: 'other', default: true }
];

var npo_membership_statuses = [
    { id: 'not_member', default: true },
    { id: 'request_approved' },
    { id: 'member_paid' },
    { id: 'member_should_pay' },
    { id: 'banned' },
    { id: 'request_rejected' },
    { id: 'applied_for_membership' }
];

var prototype_camps = {
    THEME_CAMP: {
        id: 'theme_camp',
        name: 'Theme Camps'
    },
    ART_EXHIBIT: {
        id: 'art_exhibit',
        name: 'Art Exhibit',
    },
};
var events = {
    MIDBURN2017: {
        bundles: ['39', '40']
    }
};

module.exports = {

    // -- system constant --
    // note: Future release will change the event_id
    CURRENT_EVENT_ID: "MIDBURN2017",
    events: events,

    // -- table names --
    EVENTS_TABLE_NAME: "events",
    USERS_TABLE_NAME: "users",
    PAYMENTS_TABLE_NAME: "payments",
    NPO_MEMBERS_TABLE_NAME: "npo_members",
    CAMPS_TABLE_NAME: "camps",
    CAMP_MEMBERS_TABLE_NAME: "camp_members",
    DRUPAL_USERS_TABLE_NAME: "drupal_users",

    prototype_camps: prototype_camps,

    VOL_DEPARTMENTS_TABLE_NAME: "vol_departments",
    VOLUNTEERS_TABLE_NAME: "volunteers",
    VOL_DEPARTMENT_ROLES_TABLE_NAME: "vol_departments_roles",
    VOL_TYPES_IN_SHIFT_TABLE_NAME: "vol_types_in_shift",
    VOL_SHIFTS_TABLE_NAME: "vol_shifts",
    VOL_SCHEDULE_TABLE_NAME: "vol_schedule",

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
     *    art_exhibit - art_exhibit
     */
    CAMP_PROTOTYPE: [prototype_camps.THEME_CAMP.id, prototype_camps.ART_EXHIBIT.id],

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

};
