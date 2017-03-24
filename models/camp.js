var bookshelf = require('../libs/db').bookshelf;
var constants = require('./constants.js');
var User = require('../models/user').User;

var Camp = bookshelf.Model.extend({
    tableName: constants.CAMPS_TABLE_NAME,
    idAttribute: 'id',
    members: function() {
      return this.hasMany(CampMembers)
    }
});

var CampMember = bookshelf.Model.extend({
    tableName: constants.CAMP_MEMBERS_TABLE_NAME,
    users: function() {
        return this.belongsTo(User, 'user_id');
    },
    camps: function() {
        return this.belongsTo(Camp, 'camp_id','camp_id');
    },
});

// Create the model and expose it
module.exports = {
    Camp: Camp
};
