var bookshelf = require('../config/db').bookshelf;
var bcrypt = require('bcrypt-nodejs');

var User = bookshelf.Model.extend({
    tableName: 'users',
    idAttribute: 'user_id',

    generateHash: function (password) {
        this.attributes.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },

    validPassword: function (password) {
        return bcrypt.compareSync(password, this.attributes.password);
    },

    fullName: function () {
        return this.attributes.first_name ? this.attributes.first_name + ' ' + this.attributes.last_name : '';
    }

});

// Create the model and expose it
module.exports = {
    User: User,
    Status: {
        npo_not_member:             'npo_not_member',
        npo_request_approved:       'npo_request_approved',
        npo_member_paid:            'npo_member_paid',
        npo_member_should_pay:      'npo_member_should_pay',
        npo_banned:                 'npo_banned',
        npo_request_rejected:       'npo_request_rejected',
        npo_applied_for_membership: 'npo_applied_for_membership'
    }
};

