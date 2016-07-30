var bookshelf = require('../config/db').bookshelf;
var bcrypt    = require('bcrypt-nodejs');

var User = bookshelf.Model.extend({
    tableName: 'users',
    idAttribute: 'id',

    generateHash: function(password) {
        this.attributes.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },

    validPassword: function(password) {
        return bcrypt.compareSync(password, this.attributes.password);
    }
});

// create the model for users and expose it to our app
module.exports = {
    User: User
};

