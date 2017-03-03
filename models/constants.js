var get_default_enum = function(enu) {
    return enu.find(function(e) {
        return e.default;
    }).id;
};

var get_enum = function(enu) {
    return enu.map(function(e) {
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

module.exports = {

    // -- table names --
    
    USERS_TABLE_NAME: "users",
    PAYMENTS_TABLE_NAME: "payments",
    NPO_MEMBERS_TABLE_NAME: "npo_members",
    CAMPS_TABLE_NAME: "camps",
    CAMP_DETAILS_TABLE_NAME: "camp_details",
    DRUPAL_USERS_TABLE_NAME: "drupal_users",

    VOL_DEPARTMENTS: "vol_departments",
    VOLUNTEERS: "volunteers",
    VOL_DEPARTMENT_ROLES: "vol_departments_roles",
    VOL_TYPES_IN_SHIFT: "vol_types_in_shift",
    VOL_SHIFTS: "vol_shifts",
    VOL_SCHEDULE: "vol_schedule",

    // -- enums --
    
    USER_GENDERS: get_enum(user_genders), 
    USER_GENDERS_DEFAULT: get_default_enum(user_genders),
    
    NPO_MEMBERSHIP_STATUSES: get_enum(npo_membership_statuses), 
    NPO_MEMBERSHIP_STATUSES_DEFAULT: get_default_enum(npo_membership_statuses),
    
    CAMP_TYPES: ['food', 'drinking/bar', 'music', 'workshops', 'art-supporting', 'other'],
    
    CAMP_STATUSES: ['deleted', 'open', 'closed', 'inactive'],
    
    CAMP_ACTIVITY_TIMES: ['morning', 'noon' ,'evening' ,'night'],
    
    CAMP_NOISE_LEVELS: ['quiet' ,'medium' ,'noisy' ,'very noisy']

};
