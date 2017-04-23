var bookshelf = require('../libs/db').bookshelf;
var constants = require('./constants');

var DrupalAccess = require('../libs/drupal_acces').DrupalAccess;
var log = require('../libs/logger')(module);
var VolunteerRole = bookshelf.Model.extend({
    tableName: constants.VOL_DEPARTMENT_ROLES_TABLE_NAME,
    volunteers: function() {
        return this.belongsToMany(Volunteer, 'id', 'role_id');
    }
});

//Department
var Department = bookshelf.Model.extend({
    tableName: constants.VOL_DEPARTMENTS_TABLE_NAME,
    volunteers: function() {
        return this.hasMany(Volunteer, 'department_id');
    }
});
//Volunteer
var Volunteer = bookshelf.Model.extend({
    tableName: constants.VOLUNTEERS_TABLE_NAME,
    department: function() {
        return this.belongsTo(Department, 'department_id');
    },
    role: function() {
        return this.belongsTo(VolunteerRole, 'role_id', 'id');
    },
    user_info: function(user) {
        return DrupalAccess.get_user_info(user_id);
    }
}, {
    get_by_user: function(user_id, department_id, event_id) {
        log.debug('Looking for volunteer data for user ' + user_id);
        return new Volunteer().fetch({ user_id, department_id, event_id }).then(function(vol) {
            return vol;
        });
    }
});

module.exports = {
    Volunteer,
    VolunteerRole,
    Department
}