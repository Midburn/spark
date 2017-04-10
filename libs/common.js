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
    t_array: function (key, value_str, t) {
        if (value_str !== undefined && value_str && value_str !== '') {
            var values = value_str.split(',');
            for (let i in values) {
                let t_value = t(key + '_' + values[i]);
                if (t_value !== '') {
                    values[i] = t_value;
                }
            }
            return values.join(', ');
        } else {
            return '';
        }
    },    
}

// Create the model and expose it
module.exports = {
    common: functions,
};
