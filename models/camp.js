var bookshelf = require('../libs/db').bookshelf;

var Camp = bookshelf.Model.extend({
    tableName: 'camps',
    details: function() {
      return this.hasOne(CampDetails)
    }
});

var CampDetails = bookshelf.Model.extend({
    tableName: 'camp_details',
    camp: function() {
        return this.belongsTo(Camp);
    }
})

// Create the model and expose it
module.exports = {
    Camp: Camp,
    CampDetails: CampDetails
};
