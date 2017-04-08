

var functions = {
    __hasRole: function (role, roles) {
        return (roles && roles.split(',').indexOf(role) > -1);
    },
    __updateUserRec: function (user) {
        if (!user.name && (user.first_name || user.last_name)) {
            user.name = user.first_name + ' ' + user.last_name;
        }
        if (!user.name) {
            user.name = user.email;
        }
    },
}

// Create the model and expose it
module.exports = {
    common: functions,
};
