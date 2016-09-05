var bookshelf = require('../libs/db').bookshelf;
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

    virtuals: {
        fullName: function() {
            return this.attributes.first_name + ' ' + this.attributes.last_name;
        },

        isAdmin: function() {
            return (this.attributes.roles.split(',').indexOf('admin') > -1);
        }
    }
});

// Create the model and expose it
module.exports = {
    User: User
};

