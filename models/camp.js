var bookshelf = require('../libs/db').bookshelf;
var constants = require('./constants.js');
var User = require('../models/camp').User;

var Camp = bookshelf.Model.extend({
    tableName: constants.CAMPS_TABLE_NAME,
    members: function() {
      return this.hasOne(CampMembers)
    }
});

var CampMembers = bookshelf.Model.extend({
    tableName: constants.CAMP_MEMBERS_TABLE_NAME,
    camp: function() {
        return this.belongsTo(User, 'user_id')
    }
});

// Create the model and expose it
module.exports = {
    Camp: Camp,
    User: User,
    CampMembers: CampMembers
};
