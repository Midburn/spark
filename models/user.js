const common = require('../libs/common').common;
var bookshelf = require('../libs/db').bookshelf;
var bcrypt = require('bcrypt-nodejs');
var randtoken = require('rand-token');
var NpoMember = require('./npo_member').NpoMember;
var constants = require('./constants.js');
var userRole = require('../libs/user_role');
const knex = require('../libs/db').knex;

var User = bookshelf.Model.extend({
    tableName: constants.USERS_TABLE_NAME,
    idAttribute: 'user_id',
    npoMember: function () {
        return this.hasMany(NpoMember);
    },

    generateHash: function (password) {
        this.attributes.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },

    generateValidation: function () {
        var date = new Date();
        var offset = (24 * 60 * 60 * 1000); // hours*minutes*seconds*millis
        date.setTime(date.getTime() + offset);
        this.attributes.email_validation_expires = date.toISOString().slice(0, 19).replace('T', ' ');
        this.attributes.email_validation_token = randtoken.generate(32);
    },

    validate: function () {
        var expires = new Date(this.attributes.email_validation_expires);
        if (expires.getTime() > Date.now()) {
            this.attributes.validated = true;
            this.attributes.email_validation_token = null;
            this.attributes.email_validation_expires = null;
            return true;
        }
        return false;
    },
    /**
     * get this.user_id camps he is in for the CURRENT_EVENT_ID, executing function done.
     * updates:
     *  user.attributes.camp - for the first camp user is involved
     *  user.attribute.is_manager - for the camp if has manager flag.
     *  user.attributes.camps - array of all camps user is involved.
     */
    getUserCamps: function (done, t) {
        var _camps_members = constants.CAMP_MEMBERS_TABLE_NAME;
        var _camps = constants.CAMPS_TABLE_NAME;
        var _this_user = this;
        knex(_camps)
            .select(_camps + '.*', _camps_members + '.status AS member_status')
            .innerJoin(_camps_members, _camps + '.id', _camps_members + '.camp_id')
            .where({ user_id: this.attributes.user_id, event_id: constants.CURRENT_EVENT_ID, __prototype: constants.prototype_camps.THEME_CAMP.id })
            .then((camps) => {
                var first_camp;
                var is_manager = false;
                var member_type_array = ['approved', 'pending', 'pending_mgr', 'approved_mgr', 'supplier'];
                for (var i in camps) {
                    let _status = camps[i].member_status;
                    if (t !== undefined) { // translate function
                        camps[i].member_status_i18n = t('camps:members.status_' + _status);
                        // @TODO: update to req instead t for all places in the code
                    }
                    if (!first_camp && member_type_array.indexOf(_status) > -1) {
                        first_camp = camps[i];
                    }
                    if (((camps[i].main_contact === this.attributes.user_id || common.__hasRole('camp_manager', this.attributes.roles))
                        && camps[i].member_status === 'approved')
                        || (camps[i].member_status === 'approved_mgr')) {
                        first_camp = camps[i];
                        is_manager = true;
                        break;
                    }
                }
                _this_user.attributes.camps = camps;
                _this_user.attributes.camp = first_camp;
                _this_user.attributes.camp_manager = is_manager;
                _this_user.__initUser = true;
                done(camps);
            });
    },

    validPassword: function (password) {
        return bcrypt.compareSync(password, this.attributes.password);
    },
    hasRole: function (role) {
        return common.__hasRole(role, this.attributes.roles);
    },
    isManagerOfCamp: function (camp_id) {
        let isCampManager = false;
        if (this.attributes.camp && this.attributes.camp.id === parseInt(camp_id) && this.attributes.camp_manager) {
            isCampManager = true;
        }
        return isCampManager;
    },
    init_t: function (t) {
        if (t !== undefined) {
            this.attributes.gender_i18n = t(this.attributes.gender);
            // this.attributes.noise_level_i18n = this.t_array('camps:new.camp_noise_level', this.attributes.noise_level, t);
        }
    },

    virtuals: {
        fullName: function () {
            return this.attributes.first_name + ' ' + this.attributes.last_name;
        },

        isAdmin: function () {
            return this.hasRole(userRole.ADMIN);
        },

        isCampManager: function () {
            return this.hasRole(userRole.CAMP_MANAGER);
        },

        isCampFree: function () {
            return (!this.attributes.camp);
        },

        isCampJoinPending: function () {
            return Number(this.attributes.camp_id) === -1
        }
    }
});

var DrupalUser = bookshelf.Model.extend({
    tableName: constants.DRUPAL_USERS_TABLE_NAME,

    validPassword: function (password) {
        var child_process = require('child_process');
        var res = child_process.execFileSync('python', ["libs/drupal_7_pw.py", this.attributes.pass], { 'input': password + "\n" });
        msg = res.toString('ascii');
        return (msg.indexOf('Yey! win') > -1);
    }
});

// Create the model and expose it
module.exports = {
    User: User,
    DrupalUser: DrupalUser
};
