var bookshelf = require('../libs/db').bookshelf;
var constants = require('./constants.js');

var Camp = bookshelf.Model.extend({
    tableName: constants.CAMPS_TABLE_NAME,
    details: function() {
      return this.hasOne(CampDetails)
    },
    members: function() {
        return this.hasMany(CampMembers)
    }
});

var CampDetails = bookshelf.Model.extend({
    tableName: constants.CAMP_DETAILS_TABLE_NAME,
    camp: function() {
        return this.belongsTo(Camp);
    }
});

var CampMembers = bookshelf.Model.extend({
    tableName: constants.CAMP_MEMBERS_TABLE_NAME,
    camp: function() {
        return this.belongsTo(Camp);
    }

});

// Create the model and expose it
module.exports = {
    Camp: Camp,
    CampDetails: CampDetails
};
