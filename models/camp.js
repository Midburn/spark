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
    getCampUsers: function (done) {
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
                    users[i].isManager=false;
                    let _status = users[i].member_status;
                    users[i].can_delete=(['rejected'].indexOf(_status)>-1)?true:false;
                    users[i].can_approve=(['pending'].indexOf(_status)>-1)?true:false;
                    users[i].can_reject=(['pending','approved'].indexOf(_status)>-1)?true:false;
                    
                    if (!users[i].name && (users[i].first_name || users[i].last_name)) {
                        users[i].name=users[i].first_name+' '+users[i].last_name;
                    }
                    if (!users[i].name) {
                        users[i].name=users[i].email;
                    }

                    if ((_this.attributes.main_contact === users[i].user_id && users[i].member_status === 'approved') || (users[i].member_status === 'approved_mgr')) {
                        users[i].isManager=true;
                        managers.push(users[i]);
                    }
                }
                _this.attributes.users = users;
                _this.attributes.managers = managers;
                done(users);
            });
    },
    isCampManager: function (user_id) {
        user_id=parseInt(user_id);
        for (var i in this.attributes.managers) {
            if (this.attributes.managers[i].user_id===user_id)
             return this.attributes.managers[i];
        }
    },
    isUserInCamp: function (user_id) {
        user_id=parseInt(user_id);
        for (var i in this.attributes.users) {
            if (this.attributes.users[i].user_id===user_id) {
                return this.attributes.users[i];
            }
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
    idAttribute: 'user_id',
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
