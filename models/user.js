const _ = require('lodash');
const i18next = require('i18next');
const bcrypt = require('bcrypt-nodejs');
const randtoken = require('rand-token');
const common = require('../libs/common').common;
const bookshelf = require('../libs/db').bookshelf;
const knex = require('../libs/db').knex;
const NpoMember = require('./npo_member').NpoMember;
const constants = require('./constants.js');
const userRole = require('../libs/user_role');
/////////////////////////////////////////////////////////////
/////////////////////////// USER  ///////////////////////////
/////////////////////////////////////////////////////////////
const User = bookshelf.Model.extend({
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

    camp_memberships: function() {
        return this.hasMany(CampMember, 'user_id');
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
        return this.hasMany(NpoMember); //TODO maybe hasOne is better?
    },

    /////////////////////////// CAMPS ///////////////////////////
    __parsePrototype: function (prototype, user) {
        let result = constants.prototype_camps.by_prototype(prototype);
        if (!result) return false;
        let isAdmin = false;
        let t_prefix = '';
        if (user instanceof User) {
            isAdmin = user.isAdmin;
            if (prototype === constants.prototype_camps.THEME_CAMP.id) {
                isAdmin = isAdmin || user.isCampsAdmin;
                t_prefix = 'camps:';
            } else if (prototype === constants.prototype_camps.ART_INSTALLATION.id) {
                isAdmin = isAdmin || user.isArtInstallationsAdmin;
                t_prefix = 'camps:art_installation.';
            } else if (prototype === constants.prototype_camps.PROD_DEP.id) {
                isAdmin = isAdmin || user.isProdDepsAdmin;
                t_prefix = 'camps:prod_dep.';
            }
        }
        result.isAdmin = isAdmin;
        result.t_prefix = t_prefix;
        return result;
    },
    parsePrototype: function (prototype) {
        return this.__parsePrototype(prototype,this);
    },

    /**
     * get this.user_id camps he is in for the CURRENT_EVENT_ID, executing function done.
     * updates:
     *  user.attributes.camp - for the first camp user is involved
     *  user.attribute.is_manager - for the camp if has manager flag.
     *  user.attributes.camps - array of all camps user is involved.
     */
    getUserCamps: function (done, req, prototype) {
        let t;
        // let _current_user;
        if (typeof (req) === 'function') {
            t = req;
        }
        if (req && typeof (req) === 'object' && typeof (req['t']) === 'function') {
            t = req.t;
        }
        var _camps_members = constants.CAMP_MEMBERS_TABLE_NAME;
        var _camps = constants.CAMPS_TABLE_NAME;
        var _this_user = this;
        if (!prototype) prototype = constants.prototype_camps.THEME_CAMP.id;
        let _where = {
            user_id: this.attributes.user_id,
            'camps.event_id': this.currentEventId,
        };
        if (prototype !== 'all') _where['__prototype'] = prototype;
        knex(_camps)
            .select(_camps + '.*', _camps_members + '.status AS member_status',_camps_members + '.addinfo_json AS camps_members_addinfo_json','users_groups.entrance_quota')
            .innerJoin(_camps_members, _camps + '.id', _camps_members + '.camp_id')
            .innerJoin('users_groups', _camps + '.id', 'users_groups.group_id')
            .where(_where)
            .then((camps) => {
                let first_camp = null;
                let is_manager = false;
                let member_type_array = ['approved', 'pending', 'pending_mgr', 'approved_mgr', 'supplier'];
                for (let i in camps) {
                    let _status = camps[i].member_status;
                    let group_props=this.parsePrototype(camps[i].__prototype);
                    if (t) { // translate function
                        camps[i].member_status_i18n = t('camps:members.status_' + _status);
                    }
                    if (['open', 'closed'].indexOf(camps[i].status) > -1 && !first_camp && member_type_array.indexOf(_status) > -1) {
                        first_camp = camps[i];
                    }
                    if ((['open', 'closed'].indexOf(camps[i].status) > -1 || !group_props.require_group_status_open_closed) && (((camps[i].main_contact === this.attributes.user_id || common.__hasRole('camp_manager', this.attributes.roles))
                        && camps[i].member_status === 'approved')
                        || (camps[i].member_status === 'approved_mgr'))) {
                        first_camp = camps[i];
                        is_manager = true;
                        camps[i].isManager = true;
                        // break;
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
        for (let i in this.attributes.camps) {
            if (this.attributes.camps[i].id === camp_id && this.attributes.camps[i].member_status !== 'deleted') {
                return this.attributes.camps[i];
            }
        }
    },
    isManagerOfCamp: function (camp_id) {
        camp_id = parseInt(camp_id);
        // let isCampManager = false;
        for (let i in this.attributes.camps) {
            if (this.attributes.camps[i].id === camp_id && this.attributes.camps[i].isManager) {
                return this.attributes.camps[i];
            }
        }
        // return isCampManager;
        //
        // if (this.attributes.camp && this.attributes.camp.id === parseInt(camp_id) && this.attributes.camp_manager) {
        //     isCampManager = true;
        // }
        // return isCampManager;
    },

    /////////////////////////// VIRTUALS ///////////////////////////

    virtuals: {
        fullName: function () {
            return this.attributes.first_name + ' ' + this.attributes.last_name;
        },

        isAdmin: function () {
            return this.hasRole(userRole.ADMIN);
        },
        isGateManager: function () {
            return this.hasRole(userRole.GATE_MANAGER);
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

        isAllowedToViewSuppliers: function () {
            return this.hasRole(userRole.ADMIN)
                || this.hasRole(userRole.GATE_MANAGER) || this.hasRole(userRole.CAMP_MANAGER) || this.hasRole(userRole.THEME_CAMPS_ADMIN);
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
        return this.belongsToMany(User, 'users_groups_membership', 'group_id', 'user_id', 'group_id', 'user_id');
    },
    usersMembership: function () {
        return this.hasMany(User);
    },

    virtuals: {
        usersInsideEventsCounter: async function () {
            return knex('tickets')
                .count('inside_event')
                .where('entrance_group_id', '=', this.attributes.group_id)
                .then(count => {
                    return count[0]['count(`inside_event`)'];

                });
        },
        quotaReached: async function () {
            let inside = await this.usersInsideEventsCounter;
            return (inside >= this.attributes.entrance_quota);
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

// Why here? to prevent circular dependency
const CampMember = bookshelf.Model.extend({
    tableName: constants.CAMP_MEMBERS_TABLE_NAME,
    idAttribute: 'user_id,camp_id',
    users: function () {
        return this.hasMany(User, 'user_id')
    },
    camps: function () {
        return this.belongsTo(Camp, 'camp_id')
    }

});
////////////////////////////////////////////////////////////////
/////////////////////////// EXPORTS  ///////////////////////////
////////////////////////////////////////////////////////////////

module.exports = {
    User: User,
    UsersGroup: UsersGroup,
    UsersGroupMembership: UsersGroupMemberShip,
    CampMember: CampMember,
    DrupalUser: DrupalUser
};
