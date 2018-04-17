const common = require('../libs/common').common;
const bookshelf = require('../libs/db').bookshelf;
const constants = require('./constants.js');
const models = require('./user');
const User = models.User;
const UsersGroup = models.UsersGroup;
const CampMember = models.CampMember;
const knex = require('../libs/db').knex;

const Camp = bookshelf.Model.extend({
    tableName: constants.CAMPS_TABLE_NAME,
    idAttribute: 'id',
    members: function () {
        return this.hasMany(CampMember, 'camp_id')
    },
    users_groups: function () {
        return this.hasOne(UsersGroup, 'group_id');
    },
    files: function () {
        return this.hasMany(CampFile, 'camp_id')
    },
    /**
     * get this camp users. the result is on attributes.users or attributes.managers
     * to check if camp has manager check attributes.managers.length>0
     */
    getCampUsers: function (done, req) {
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

        // let _camps_members = constants.CAMP_MEMBERS_TABLE_NAME;
        // let _users = constants.USERS_TABLE_NAME;
        let query = "SELECT users.*,camp_members.status AS member_status,SUM(IF(tickets.ticket_id>0,1,0)) AS ticket_count,SUM(tickets.inside_event) AS inside_event, camp_members.addinfo_json AS camps_members_addinfo_json FROM users INNER JOIN camp_members on users.user_id=camp_members.user_id left join tickets on tickets.holder_id=users.user_id and tickets.event_id='" + this.attributes.event_id + "' where camp_members.camp_id=" + this.attributes.id + " group by users.user_id,member_status, camps_members_addinfo_json";
        return knex //(_users)
            .raw(query)
            .then((users_raw_data) => {
                let users = users_raw_data[0];
                let managers = [];
                // let emails
                for (let i in users) {
                    // console.log(i);
                    users[i].isManager = false;
                    if (['open', 'closed'].indexOf(_this.attributes.status) === -1) {
                        users[i].member_status = 'deleted';
                    }
                    let _status = users[i].member_status;
                    common.__updateUserRec(users[i]);
                    users[i].can_remove = ['rejected', 'pending_mgr',].indexOf(_status) > -1;
                    users[i].can_approve = ['pending', 'rejected'].indexOf(_status) > -1 && users[i].validated;
                    users[i].can_reject = ['pending', 'approved'].indexOf(_status) > -1 && _this.attributes.main_contact !== users[i].user_id;
                    if (((_this.attributes.main_contact === users[i].user_id /*|| common.__hasRole('camp_manager', users[i].roles)*/)
                        && users[i].member_status === 'approved')
                        || (users[i].member_status === 'approved_mgr')) {
                        users[i].isManager = true;
                        managers.push(users[i]);
                    } else {
                        users[i].isManager = false;
                    }
                    users[i].can_approve_mgr = ['approved'].indexOf(_status) > -1 && _this.attributes.main_contact !== users[i].user_id && _current_user &&
                        (_current_user.attributes.user_id === _this.attributes.main_contact || _current_user.attributes.isAdmin);
                    users[i].can_remove_mgr = ['approved_mgr'].indexOf(_status) > -1 && _this.attributes.main_contact !== users[i].user_id && _current_user &&
                        (_current_user.attributes.user_id === _this.attributes.main_contact || _current_user.attributes.isAdmin);
                    if (t !== undefined) { // translate function
                        if (users[i].isManager) {
                            _status = 'approved_mgr';
                        }
                        users[i].member_status_i18n = t('camps:members.status_' + _status);
                    }
                }
                _this.attributes.users = users;
                _this.attributes.managers = managers;
                done(users);
            });
    },
    getCampSuppliers: async function(done) {
        try {
            let suppliers = await knex(constants.SUPPLIERS_RELATIONS_TABLE_NAME).select()
                .innerJoin(constants.SUPPLIERS_TABLE_NAME, constants.SUPPLIERS_RELATIONS_TABLE_NAME + '.supplier_id', constants.SUPPLIERS_TABLE_NAME + '.supplier_id')
                .where(constants.SUPPLIERS_RELATIONS_TABLE_NAME + '.camp_id', this.attributes.id);
            if (typeof done === 'function') {
                done(suppliers);
            }
            return suppliers;
        } catch (err) {
            throw err;
        }

    },
    isCampManager: function (user_id) {
        user_id = parseInt(user_id);
        for (var i in this.attributes.managers) {
            if (this.attributes.managers[i].user_id === user_id) {
                return this.attributes.managers[i];
            }
        }
    },
    isUserInCamp: function (user_id, include_deleted) {
        user_id = parseInt(user_id);
        for (var i in this.attributes.users) {
            if (this.attributes.users[i].user_id === user_id && (this.attributes.users[i].member_status !== 'deleted' || include_deleted)) {
                return this.attributes.users[i];
            }
        }
    },
    isUserCampMember: function (user_id) {
        user_id = parseInt(user_id);
        for (var i in this.attributes.users) {
            if (this.attributes.users[i].user_id === user_id && ['approved', 'approved_mgr'].indexOf(this.attributes.users[i].member_status) > -1) {
                return this.attributes.users[i];
            }
        }
    },
    init_t: function (t) {
        if (t !== undefined) {
            this.attributes.camp_activity_time_i18n = common.t_array('camps:new.camp_activity_time', this.attributes.camp_activity_time, t);
            this.attributes.noise_level_i18n = common.t_array('camps:new.camp_noise_level', this.attributes.noise_level, t);
            this.attributes.type_i18n = common.t_array('camps:edit', this.attributes.type, t, '.');
            this.attributes.camp_desc_he_linkify = common.linkify(this.attributes.camp_desc_he || '');
            this.attributes.camp_desc_en_linkify = common.linkify(this.attributes.camp_desc_en || '');
        }
    },
    __parsePrototype: function(prototype, user) {
        return User.prototype.__parsePrototype(prototype, user);
    },

    parsePrototype: function (user) {
        return this.__parsePrototype(this.attributes.__prototype, user);
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

const CampFile = bookshelf.Model.extend({
    tableName: constants.CAMP_FILES_TABLE_NAME,
    idAttribute: 'file_id',
    camp: function() {
        return belongsTo(Camp);
    }
})

// Create the model and expose it
module.exports = {
    Camp: Camp,
    CampFile: CampFile
    // __parsePrototype: __parsePrototype,
};
