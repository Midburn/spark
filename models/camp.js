const common = require('../libs/common').common;
var bookshelf = require('../libs/db').bookshelf;
var constants = require('./constants.js');
var User = require('../models/user').User;
const knex = require('../libs/db').knex;

var Camp = bookshelf.Model.extend({
    tableName: constants.CAMPS_TABLE_NAME,
    idAttribute: 'id',
    members: function () {
        return this.hasMany(CampMember, 'camp_id')
    },
    /**
     * get this camp users. the result is on attributes.users or attributes.managers
     * to check if camp has manager check attributes.managers.length>0
     */
    getCampUsers: function (done, t) {
        // function __hasRole(role, roles) {
        //     return (roles && roles.split(',').indexOf(role) > -1);
        // }
        var _this = this;
        var _camps_members = constants.CAMP_MEMBERS_TABLE_NAME;
        var _users = constants.USERS_TABLE_NAME;
        knex(_users)
            .select(_users + '.*', _camps_members + '.status AS member_status')
            .innerJoin(_camps_members, _users + '.user_id', _camps_members + '.user_id')
            .where({ 'camp_members.camp_id': this.attributes.id })
            .then((users) => {
                let managers = [];
                for (let i in users) {
                    users[i].isManager = false;
                    let _status = users[i].member_status;
                    if (t !== undefined) { // translate function
                        users[i].member_status_i18n = t('camps:members.status_' + _status);
                    }
                    common.__updateUserRec(users[i]);
                    users[i].can_remove = ['rejected', 'pending_mgr',].indexOf(_status) > -1;
                    users[i].can_approve = ['pending', 'rejected'].indexOf(_status) > -1 && users[i].validated;
                    users[i].can_reject = ['pending', 'approved'].indexOf(_status) > -1 && _this.attributes.main_contact !== users[i].user_id;
                    
                    if (((_this.attributes.main_contact === users[i].user_id || common.__hasRole('camp_manager', users[i].roles))
                        && users[i].member_status === 'approved')
                        || (users[i].member_status === 'approved_mgr')) {
                        users[i].isManager = true;
                        managers.push(users[i]);
                    }
                }
                _this.attributes.users = users;
                _this.attributes.managers = managers;
                done(users);
            });
    },
    isCampManager: function (user_id) {
        user_id = parseInt(user_id);
        for (var i in this.attributes.managers) {
            if (this.attributes.managers[i].user_id === user_id) {
                return this.attributes.managers[i];
            }
        }
    },
    isUserInCamp: function (user_id) {
        user_id = parseInt(user_id);
        for (var i in this.attributes.users) {
            if (this.attributes.users[i].user_id === user_id && this.attributes.users[i].member_status !== 'deleted') {
                return this.attributes.users[i];
            }
        }
    },
    isUserCampMember: function (user_id) {
        user_id = parseInt(user_id);
        for (var i in this.attributes.users) {
            if (this.attributes.users[i].user_id === user_id && ['approved','approved_mgr'].indexOf(this.attributes.users[i].member_status)>-1) {
                return this.attributes.users[i];
            }
        }
    },
    init_t: function (t) {
        if (t !== undefined) {
            this.attributes.camp_activity_time_i18n = common.t_array('camps:new.camp_activity_time', this.attributes.camp_activity_time, t);
            this.attributes.noise_level_i18n = common.t_array('camps:new.camp_noise_level', this.attributes.noise_level, t);
            this.attributes.type_i18n = common.t_array('camps:edit', this.attributes.type, t, '.');
            this.attributes.camp_desc_he_linkify = common.linkify(this.attributes.camp_desc_he);
            this.attributes.camp_desc_en_linkify = common.linkify(this.attributes.camp_desc_en);
        }
    },
    virtuals: {
        managers: function () {
            return this.attributes.managers;
        },
        users: function () {
            return this.attributes.users;
        }
    }
});

var CampMember = bookshelf.Model.extend({
    tableName: constants.CAMP_MEMBERS_TABLE_NAME,
    idAttribute: 'user_id,camp_id',
    users: function () {
        return this.hasMany(User, 'user_id')
    },
    camps: function () {
        return this.belongsTo(Camp, 'camp_id')
    }

});

// Create the model and expose it
module.exports = {
    Camp: Camp,
    CampMember: CampMember,
};
