const common = require('../libs/common').common;
var bookshelf = require('../libs/db').bookshelf;
var bcrypt = require('bcrypt-nodejs');
var randtoken = require('rand-token');
var NpoMember = require('./npo_member').NpoMember;
var constants = require('./constants.js');
var userRole = require('../libs/user_role');
var _ = require('lodash');
var i18next = require('i18next');
const knex = require('../libs/db').knex;

/////////////////////////////////////////////////////////////
/////////////////////////// USER  ///////////////////////////
/////////////////////////////////////////////////////////////

var User = bookshelf.Model.extend({
    tableName: constants.USERS_TABLE_NAME,
    idAttribute: 'user_id',

    /////////////////////////// USER MANAGEMENT ///////////////////////////

    generateHash: function (password) {
        this.attributes.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },

    generateValidation: function () {
        var date = new Date();
        var offset = (24 * 60 * 60 * 1000); // hours*minutes*seconds*millis
        date.setTime(date.getTime() + offset);
        this.attributes.email_validation_expires = date.toISOString().slice(0, 19).replace('T', ' ');
        this.attributes.email_validation_token = randtoken.generate(32);
    },

    validate: function () {
        var expires = new Date(this.attributes.email_validation_expires);
        if (expires.getTime() > Date.now()) {
            this.attributes.validated = true;
            this.attributes.email_validation_token = null;
            this.attributes.email_validation_expires = null;
            return true;
        }
        return false;
    },

    validPassword: function (password) {
        return this.attributes.password && bcrypt.compareSync(password, this.attributes.password);
    },
    hasRole: function (role) {
        return common.__hasRole(role, this.attributes.roles);
    },

    /////////////////////////// GROUPS ///////////////////////////

    groups: function () {
        return this.belongsToMany(UsersGroup, 'users_groups_membership', 'user_id', 'group_id', 'user_id', 'group_id');
    },

    groupsMembership: function () {
        return this.hasMany(UsersGroup);
    },

    /**
     * Adds a user to a group. The function returns the group and the caller is responsible to save it.
     */
    addToGroup: function (group_id) {
        let membership = null;

        if (this.relations.groupsMembership && this.relations.groupsMembership.models.length > 0) {
            _.each(this.relations.groupsMembership.models, aMembership => {
                if (aMembership.attributes.user_id === this.attributes.user_id &&
                    aMembership.attributes.group_id === group_id) {
                    membership = aMembership;
                }
            })
        }

        if (!membership) {
            membership = UsersGroupMemberShip.forge({ user_id: this.attributes.user_id, group_id: group_id });
        }

        return membership;
    },

    /////////////////////////// NPO ///////////////////////////

    npoMember: function () {
        return this.hasMany(NpoMember);  //TODO maybe hasOne is better?
    },

    /////////////////////////// CAMPS ///////////////////////////

    /**
     * get this.user_id camps he is in for the CURRENT_EVENT_ID, executing function done.
     * updates:
     *  user.attributes.camp - for the first camp user is involved
     *  user.attribute.is_manager - for the camp if has manager flag.
     *  user.attributes.camps - array of all camps user is involved.
     */
    getUserCamps: function (done, req) {
        var _camps_members = constants.CAMP_MEMBERS_TABLE_NAME;
        var _camps = constants.CAMPS_TABLE_NAME;
        var _this_user = this;
        knex(_camps)
            .select(_camps + '.*', _camps_members + '.status AS member_status')
            .innerJoin(_camps_members, _camps + '.id', _camps_members + '.camp_id')
            .where({
                user_id: this.attributes.user_id,
                event_id: constants.CURRENT_EVENT_ID,
                __prototype: constants.prototype_camps.THEME_CAMP.id
            })
            .then((camps) => {
                let first_camp = null;
                let is_manager = false;
                let member_type_array = ['approved', 'pending', 'pending_mgr', 'approved_mgr', 'supplier'];
                for (var i in camps) {
                    let _status = camps[i].member_status;
                    if (req !== undefined) { // translate function
                        camps[i].member_status_i18n = req('camps:members.status_' + _status);
                    }
                    if (['open', 'closed'].indexOf(camps[i].status) > -1 && !first_camp && member_type_array.indexOf(_status) > -1) {
                        first_camp = camps[i];
                    }
                    if (['open', 'closed'].indexOf(camps[i].status) > -1 && (((camps[i].main_contact === this.attributes.user_id || common.__hasRole('camp_manager', this.attributes.roles))
                        && camps[i].member_status === 'approved')
                        || (camps[i].member_status === 'approved_mgr'))) {
                        first_camp = camps[i];
                        is_manager = true;
                        break;
                    }
                }
                _this_user.attributes.camps = camps;
                _this_user.attributes.camp = first_camp;
                _this_user.attributes.camp_manager = is_manager;
                _this_user.__initUser = true;
                done(camps);
            });
    },
    isUserInCamp: function (camp_id) {
        camp_id = parseInt(camp_id);
        for (var i in this.attributes.camps) {
            if (this.attributes.camps[i].id === camp_id && this.attributes.camps[i].member_status !== 'deleted') {
                return this.attributes.camps[i];
            }
        }
    },
    isManagerOfCamp: function (camp_id) {
        let isCampManager = false;
        if (this.attributes.camp && this.attributes.camp.id === parseInt(camp_id) && this.attributes.camp_manager) {
            isCampManager = true;
        }
        return isCampManager;
    },

    /////////////////////////// VIRTUALS ///////////////////////////

    virtuals: {
        fullName: function () {
            return this.attributes.first_name + ' ' + this.attributes.last_name;
        },

        isAdmin: function () {
            return this.hasRole(userRole.ADMIN);
        },

        isCampManager: function () {
            return this.hasRole(userRole.CAMP_MANAGER);
        },
        isCampsAdmin: function () {
            return this.hasRole(userRole.THEME_CAMPS_ADMIN);
        },
        isArtInstallationsAdmin: function () {
            return this.hasRole(userRole.ART_INSTALLATION_ADMIN);
        },
        isProdDepsAdmin: function () {
            return this.hasRole(userRole.PROD_DEP_ADMIN);
        },
        isCampFree: function () {
            return (!this.attributes.camp);
        },

        isCampJoinPending: function () {
            return Number(this.attributes.camp_id) === -1
        },

        gender_i18n: function () {
            return i18next.t(this.attributes.gender);
        }
    }
});

///////////////////////////////////////////////////////////////////
/////////////////////////// DrupalUser  ///////////////////////////
///////////////////////////////////////////////////////////////////

var DrupalUser = bookshelf.Model.extend({
    tableName: constants.DRUPAL_USERS_TABLE_NAME,

    validPassword: function (password) {
        var child_process = require('child_process');
        var res = child_process.execFileSync('python', ["libs/drupal_7_pw.py", this.attributes.pass], { 'input': password + "\n" });
        msg = res.toString('ascii');
        return (msg.indexOf('Yey! win') > -1);
    }
});

////////////////////////////////////////////////////////////////////
/////////////////////////// USERS GROUP  ///////////////////////////
////////////////////////////////////////////////////////////////////

var UsersGroup = bookshelf.Model.extend({
    tableName: 'users_groups',
    idAttribute: 'group_id',

    users: function () {
        // this.attributes.group_id
        return this.belongsToMany(User, 'users_groups_membership', 'group_id', 'user_id', 'group_id', 'user_id');
        // return this.belongsToMany(User).through(UsersGroupMemberShip);
    },
    // groups: function () {
    // return this.belongsToMany(UsersGroup, 'users_groups_membership', 'user_id', 'group_id', 'user_id', 'group_id');
    // },
    getGroupUsers: function(done,req) {
    // getCampUsers: function (done, req) {
        var _this = this;
        let t, _current_user;
        if (typeof (req) === 'function') {
            t = req;
        }
        if (typeof (req) === 'object' && typeof (req['t']) === 'function') {
            t = req.t;
            if (req['user']) {
                _current_user = req.user;
            }
        }

        let _camps_members = 'users_groups_membership';
        let _users = constants.USERS_TABLE_NAME;
        knex(_users)
            .select(_users + '.*', _camps_members + '.status AS member_status')
            .innerJoin(_camps_members, _users + '.user_id', _camps_members + '.user_id')
            .where({ 'users_groups_membership.camp_id': this.attributes.group_id })
            .then((users) => {
                // let managers = [];
                // for (let i in users) {
                //     users[i].isManager = false;
                //     if (['open', 'closed'].indexOf(_this.attributes.status) === -1) {
                //         users[i].member_status = 'deleted';
                //     }
                //     let _status = users[i].member_status;
                //     common.__updateUserRec(users[i]);
                //     users[i].can_remove = ['rejected', 'pending_mgr',].indexOf(_status) > -1;
                //     users[i].can_approve = ['pending', 'rejected'].indexOf(_status) > -1 && users[i].validated;
                //     users[i].can_reject = ['pending', 'approved'].indexOf(_status) > -1 && _this.attributes.main_contact !== users[i].user_id;
                //     if (((_this.attributes.main_contact === users[i].user_id /*|| common.__hasRole('camp_manager', users[i].roles)*/)
                //         && users[i].member_status === 'approved')
                //         || (users[i].member_status === 'approved_mgr')) {
                //         users[i].isManager = true;
                //         managers.push(users[i]);
                //     } else {
                //         users[i].isManager = false;
                //     }
                //     users[i].can_approve_mgr = ['approved'].indexOf(_status) > -1 && _this.attributes.main_contact !== users[i].user_id && _current_user &&
                //         (_current_user.attributes.user_id === _this.attributes.main_contact || _current_user.attributes.isAdmin);
                //     users[i].can_remove_mgr = ['approved_mgr'].indexOf(_status) > -1 && _this.attributes.main_contact !== users[i].user_id && _current_user &&
                //         (_current_user.attributes.user_id === _this.attributes.main_contact || _current_user.attributes.isAdmin);
                //     if (t !== undefined) { // translate function
                //         if (users[i].isManager) {
                //             _status = 'approved_mgr';
                //         }
                //         users[i].member_status_i18n = t('camps:members.status_' + _status);
                //     }
                // }
                // _this.attributes.users = users;
                // _this.attributes.managers = managers;
                done(users);
            });
    },
    usersMembership: function () {
        return this.hasMany(User, 'group_id', 'user_id');
    },

    virtuals: {
        usersInsideCounter: function () {
            let insideCounter = 0;
            _.each(this.users, user => {
                var foundTicket = 0;
                _.each(user.tickets, ticket => {
                    if (ticket.attributs.inside_event) {
                        foundTicket = 1;
                    }
                });
                insideCounter += foundTicket;
            });
            return insideCounter;
        },
        quotaReached: function () {
            return (this.usersInsideCounter >= this.attributes.entrance_quota);
        }
    }
});

//////////////////////////////////////////////////////////////////////////////
/////////////////////////// USER  GROUP MEMBERSHIP ///////////////////////////
//////////////////////////////////////////////////////////////////////////////

var UsersGroupMemberShip = bookshelf.Model.extend({
    tableName: 'users_groups_membership',
    idAttribute: ['group_id, user_id'],

    group: function () {
        return this.belongsTo(UsersGroup, 'group_id');
    }
});

////////////////////////////////////////////////////////////////
/////////////////////////// EXPORTS  ///////////////////////////
////////////////////////////////////////////////////////////////

module.exports = {
    User: User,
    UsersGroup: UsersGroup,
    UsersGroupMembership: UsersGroupMemberShip,
    DrupalUser: DrupalUser
};
