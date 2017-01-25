var bookshelf = require('../libs/db').bookshelf;
var bcrypt = require('bcrypt-nodejs');
var User = require('./user').User;
var constants = require('./constants.js');

var NpoMember = bookshelf.Model.extend({
    tableName: constants.NPO_MEMBERS_TABLE_NAME,
    idAttribute: 'user_id',
    user: function() {
        return this.belongsTo(User, 'user_id');
    }
});

// Create the model and expose it
module.exports = {
    NpoMember: NpoMember,
    NPO_STATUS: {
        not_member:             'not_member',
        request_approved:       'request_approved',
        member_paid:            'member_paid',
        member_should_pay:      'member_should_pay',
        banned:                 'banned',
        request_rejected:       'request_rejected',
        applied_for_membership: 'applied_for_membership'
    }
};

