var bookshelf = require('../libs/db').bookshelf;
var bcrypt = require('bcrypt-nodejs');
var randtoken = require('rand-token');
var NpoMember = require('./npo_member').NpoMember;
var constants = require('./constants.js');
var userRole = require('../libs/user_role');

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

    hasRole: function(role) {
        return (this.attributes.roles && this.attributes.roles.split(',').indexOf(role) > -1);
    },

    virtuals: {
        fullName: function() {
            return this.attributes.first_name + ' ' + this.attributes.last_name;
        },

        isAdmin: function() {
            return this.hasRole(userRole.ADMIN);
        }
    },

    admin: {
        columns: [
            {title: "Id", attr: "user_id", type: "primary"},
            {title: "Email", attr: "email", type: "string"},
            {title: "First name", attr: "first_name", type: "string"},
            {title: "Last name", attr: "last_name", type: "string"}
        ],
        defaultOrder: [[ 1, "asc" ]],
        filter: function(qb, searchTerm) {
            qb
                .where('email', 'LIKE', '%'+searchTerm+'%')
                .orWhere('first_name', 'LIKE', '%'+searchTerm+'%')
                .orWhere('last_name', 'LIKE', '%'+searchTerm+'%')
            ;
            if (!isNaN(searchTerm)) {
                qb.orWhere('user_id', '=', searchTerm)
            }
        },
        addTitle: "Add User",
        addCallback: function(body, done) {
            passport.signup(body.email, "", body, function(user, error) {
                if (user) {
                    done(true, "Great Success! 1 user added");
                } else {
                    done(false, error);
                }
            });
        },
        editKey: "user_id",
        editCallback: function(user_id, body, done) {
            User.forge({user_id:user_id}).save(body).then(function() {
                done(true, "Great success! updated user id "+user_id);
            }).catch(function(e) {
                done(false, "unexpected error: "+e);
            });
        }
    }
});

var DrupalUser = bookshelf.Model.extend({
    tableName: constants.DRUPAL_USERS_TABLE_NAME,

    validPassword: function(password) {
        var child_process = require('child_process');
        var res = child_process.execFileSync('python', ["libs/drupal_7_pw.py", this.attributes.pass], {'input': password+"\n"});
        msg = res.toString('ascii');
        return (msg.indexOf('Yey! win') > -1);
    }
});

// Create the model and expose it
module.exports = {
    User: User,
    DrupalUser: DrupalUser
};
