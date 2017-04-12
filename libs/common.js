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
    t_array: function (key, value_str, t, sep) {
        if (typeof sep !== 'string') {
            sep = '_';
        }
        if (value_str !== undefined && value_str && value_str !== '') {
            var values = value_str.split(',');
            for (let i in values) {
                let t_value = t(key + sep + values[i]);
                if (t_value !== '') {
                    values[i] = t_value;
                }
            }
            return values.join(', ');
        } else {
            return '';
        }
    },
    linkify: function (inputText) {
        var replacedText, replacePattern1, replacePattern2, replacePattern3;
        /*eslint-disable */
        //URLs starting with http://, https://, or ftp://
        replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

        //Change email addresses to mailto:: links.
        replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
        /*eslint-enable */ 
        return replacedText;
    }
}

// Create the model and expose it
module.exports = {
    common: functions,
};
