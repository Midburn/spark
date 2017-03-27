var bookshelf = require('../libs/db').bookshelf;
var constants = require('./constants.js');
var User = require('../models/user').User;

var Camp = bookshelf.Model.extend({
    tableName: constants.CAMPS_TABLE_NAME,
    idAttribute: 'id',
    members: function () {
        return this.hasMany(CampMember, 'camp_id')
    },
    campUsers: function (done) {
        var _camps_members = constants.CAMP_MEMBERS_TABLE_NAME;
        var _users = constants.CAMPS_TABLE_NAME;
        knex(_users)
            .select(_users + '.*', _camps_members + '.status AS member_status')
            .innerJoin(_camps_members, _users + '.user_id', _camps_members + '.camp_id')
            .where({ id: this.attributes.id, event_id: constants.CURRENT_EVENT_ID })
            .then((users) => {
                done(users);
            });
    },
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
