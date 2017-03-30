const request = require('superagent');
const _ = require('lodash');
let apiTokensConfig = require('config').get('api_tokens')
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
   * API: (POST)
   * request => /api/userlogin
   * params  => username, password, token
   * usage sample => curl --data "username=Profile_Username&password=Profile_Password&token=Secret_Token" http://localhost:3000/api/userlogin
   */
    app.post('/api/userlogin', (req, res) => {
        const { username, password, token } = _.get(req, 'body', {username: '', password: '', token: ''});
        if (apiTokensConfig.token !== token) {
            res.status(401)
                .jsonp({
                    status: 'false',
                    message: 'Invalid Token!',
                });
            return;
        }

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

