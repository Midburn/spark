var bookshelf = require('../libs/db').bookshelf;

var Camp = bookshelf.Model.extend({
    tableName: 'camps',
    // idAttribute: 'camp_id',
    //
    // validate: function() {
    //     if (this.attributes.camp_name_he != null && this.attributes.camp_name_en != null) {
    //         return true;
    //     }
    //     return false;
    // },
    //
    // campDetails: function() {
    //     return this.hasOne(CampDetails);
    // }
});

var CampDetails = bookshelf.Model.extend({
    tableName: 'camp_details',

    camp: function() {
        return this.belongsTo(Camp);
    }
})

// Create the model and expose it
module.exports = {
    Camp: Camp
};
