var bookshelf = require('../libs/db').bookshelf;
var constants = require('./constants.js');
var User = require('../models/user').User;
var Camp = require('../models/camp').Camp;

var CampMember = bookshelf.Model.extend({
    tableName: constants.CAMP_MEMBERS_TABLE_NAME,
    idAttribute: 'user_id',
    user: function() {
      return this.hasOne(User, 'user_id')
    },
    camp: function() {
      return this.hasOne(Camp, 'id')
    }
});

// Create the model and expose it
module.exports = {
    CampMember: CampMember
};
