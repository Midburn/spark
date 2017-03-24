var bookshelf = require('../libs/db').bookshelf;
var constants = require('./constants.js');
var User = require('../models/user').User;

var Camp = bookshelf.Model.extend({
    tableName: constants.CAMPS_TABLE_NAME,
    idAttribute: 'id',
    members: function() {
        return this.hasMany(CampMember, 'camp_id')
    }
});

var CampMember = bookshelf.Model.extend({
    tableName: constants.CAMP_MEMBERS_TABLE_NAME,
    idAttribute: 'user_id',
    users: function() {
        return this.hasMany(User, 'user_id')
    }
});

// Create the model and expose it
module.exports = {
    Camp: Camp
};
