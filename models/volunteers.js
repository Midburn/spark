var bookshelf = require('../libs/db').bookshelf;
var constants = require('./constants');

var DrupalAccess = require('../libs/drupal_access').DrupalAccess;
var log = require('../libs/logger')(module);
var VolunteerRole = bookshelf.Model.extend({
    tableName: constants.VOL_DEPARTMENT_ROLES_TABLE_NAME,
    volunteers: function() {
        return this.belongsToMany(Volunteer, 'id', 'role_id');
    }
});

var TypeInShift = bookshelf.Model.extend({
    tableName: constants.VOL_TYPES_IN_SHIFT_TABLE_NAME
});

//Department
var Department = bookshelf.Model.extend({
    tableName: constants.VOL_DEPARTMENTS_TABLE_NAME,
    volunteers: function() {
        return this.hasMany(Volunteer, 'department_id');
    },
    shifts: function() {
        return this.hasMany(Shift, 'id')
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
    type_in_shift: function() {
        return this.belongsTo(TypeInShift, 'type_in_shift_id');
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

//Shift
var Shift = bookshelf.Model.extend({
    tableName: constants.VOL_SHIFTS_TABLE_NAME,
    schedule: function() {
        return this.hasMany(Schedule, 'shift_id')
    },
    department: function() {
        return this.belongsTo(Department, 'department_id')
    },
});

//Schedule
var Schedule = bookshelf.Model.extend({
    tableName: constants.VOL_SCHEDULE_TABLE_NAME,
    volunteer: function() {
        return this.belongsTo(Volunteer, 'user_id', 'user_id')
    },
    shifts: function() {
        return this.belongsTo(Shift, 'shift_id')
    }

});

module.exports = {
    Volunteer,
    VolunteerRole,
    Shift,
    Department,
    Schedule,
    TypeInShift
}