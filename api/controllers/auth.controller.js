const _ = require('lodash'),
    apiTokensConfig = require('config').get('api_tokens'),
    request = require('superagent'),
    helperService = require('../services').helperService;

class AuthController {

    constructor() {
        /**
         * Keep `this` reference
         */
        this.login = this.login.bind(this);
    }

    login(req, res, next) {
        const {username, password, token} = _.get(req, 'body', {username: '', password: '', token: ''});
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
            .send({username, password})
            .then(
                ({body}) => {
                    const {user, sessid} = body;
                    const {uid, name, firstname, lastname, phone} = helperService.getUserDetailsFromDrupal(user);
                    res.status(200)
                        .jsonp({
                            status: 'true',
                            message: 'user authorized',
                            uid: uid,
                            username: name,
                            token: sessid,
                            firstname: firstname,
                            lastname: lastname,
                            phone: phone,
                        })
                },
                (error) => res.status(401)
                    .jsonp({
                        status: 'false',
                        message: 'Not authorized!',
                        error
                    })
            )
            .catch(err => {
                /**
                 * Pass error
                 */
                return next(err);
            });
    }
}

/**
 * Export singleton
 * @type {AuthController}
 */
module.exports = new AuthController();
