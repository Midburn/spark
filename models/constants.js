module.exports = {

    // table names
    USERS_TABLE_NAME: "users",
    PAYMENTS_TABLE_NAME: "payments",
    NPO_MEMBERS_TABLE_NAME: "npo_members",
    CAMPS_TABLE_NAME: "camps",
    CAMP_DETAILS_TABLE_NAME: "camp_details",
    DRUPAL_USERS_TABLE_NAME: "drupal-users",

    // enums
    USER_GENDERS: ['male', 'female', 'other'],
    NPO_MEMBERSHIP_STATUSES: ['not_member', 'request_approved', 'member_paid', 'member_should_pay', 'banned', 'request_rejected', 'applied_for_membership'],
    NPO_MEMBERSHIP_STATUSES_DEFAULT: 'not_member',
    CAMP_TYPES: ['food', 'drinking/bar', 'music', 'workshops', 'art-supporting', 'other'],
    CAMP_STATUSES: ['deleted', 'open', 'closed', 'inactive'],
    CAMP_ACTIVITY_TIMES: ['morning', 'noon' ,'evening' ,'night'],
    CAMP_NOISE_LEVELS: ['quiet' ,'medium' ,'noisy' ,'very noisy']

};
