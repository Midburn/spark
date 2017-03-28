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
                var managers = [];
                for (var i in users) {
                    if ((_this.attributes.main_contact === users[i].user_id && users[i].member_status === 'approved') || (users[i].member_status === 'approved_mgr')) {
                        managers.push(users[i]);
                    }
                }
                _this.attributes.users = users;
                _this.attributes.managers = managers;
                done(users);
            });
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
