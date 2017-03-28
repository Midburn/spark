const request = require('superagent');
const _ = require('lodash');
const userDetailsFromDrupal = (data) => {
    return {
        uid       : _.get(data, 'uid', -1),
        name      : _.get(data, 'name', ''),
        firstname : _.get(data, 'field_profile_first.und.0.value', ''),
        lastname  : _.get(data, 'field_profile_last.und.0.value', ''),
        phone     : _.get(data, 'field_profile_phone.und.0.value', -1),
    }
};
module.exports = function (app) {
    /**
   * API: (GET)
   * request => /api/userlogin
   * params  => username, password
   * usage sample => http://localhost:3000/api/userlogin?username=Profile_Username&password=Profile_Password
   */
    app.get('/api/userlogin', (req, res) => {
        const { username, password } = _.get(req, 'query', {username: '', password: ''});
        request
            .post('https://profile.midburn.org/api/user/login')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Accept', 'application/json')
            .send({ username, password })
            .then(
                ({body}) => {
                    const { user, sessid } = body;
                    const { uid, name, firstname, lastname, phone } = userDetailsFromDrupal(user);
                    res.status(200)
                        .jsonp({
                            status    : 'true',
                            message   : 'user authorized',
                            uid       : uid,
                            username  : name,
                            token     : sessid,
                            firstname : firstname,
                            lastname  : lastname,
                            phone     : phone,
                        })
                },
                (error) => res.status(401)
                    .jsonp({
                        status: 'false',
                        message: 'Not authorized!',
                        error
                    })
            );
    });
};

