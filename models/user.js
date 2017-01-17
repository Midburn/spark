var bookshelf = require('../libs/db').bookshelf;
var bcrypt = require('bcrypt-nodejs');
var randtoken = require('rand-token');
var NpoMember = require('./npo_member').NpoMember;
var constants = require('./constants.js');

var User = bookshelf.Model.extend({
    tableName: constants.USERS_TABLE_NAME,
    idAttribute: 'user_id',
    npoMember: function() {
        return this.hasMany(NpoMember);
    },

    generateHash: function(password) {
        this.attributes.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },

    generateValidation: function() {
        var date = new Date();
        var offset = (24 * 60 * 60 * 1000); // hours*minutes*seconds*millis
        date.setTime(date.getTime() + offset);

        this.attributes.email_validation_expires = date.toISOString().slice(0, 19).replace('T', ' ');
        this.attributes.email_validation_token = randtoken.generate(32);
    },

    validate: function() {
        var expires = new Date(this.attributes.email_validation_expires);
        if (expires.getTime() > Date.now()) {
            this.attributes.validated = true;
            this.attributes.email_validation_token = null;
            this.attributes.email_validation_expires = null;
            return true;
        }
        return false;
    },

    validPassword: function(password) {
        return bcrypt.compareSync(password, this.attributes.password);
    },

    virtuals: {
        fullName: function() {
            return this.attributes.first_name + ' ' + this.attributes.last_name;
        },

        isAdmin: function() {
            return (this.attributes.roles.split(',').indexOf('admin') > -1);
        }
    }
});

var DrupalUser = bookshelf.Model.extend({
    tableName: constants.DRUPAL_USERS_TABLE_NAME
});

// Create the model and expose it
module.exports = {
    User: User,
    DrupalUser: DrupalUser
};
