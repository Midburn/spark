const _ = require('lodash'),
    apiTokensConfig = require('config').get('api_tokens'),
    DrupalAccess = require('../../../libs/drupal_access').DrupalAccess,
    request = require('superagent'),
    logger = require('../../../libs/logger')(module),
    helperService = require('../services').helperService;

class AuthController {

    constructor() {
        /**
         * Keep `this` reference
         */
        this.login = this.login.bind(this);
        this.getToken = this.getToken.bind(this);
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

    /**
     * Volunteers token validation
     */
    async getToken(req, res, next) {
        let token = _.get(req, 'headers.token');
        if (apiTokensConfig.token !== token) {
            res.status(401)
                .jsonp({
                    status: 'false',
                    message: 'Invalid Token!',
                });
            return;
        }
        if (!req.body.emails) {
            return res.status(200).json([]);
        }
        let emails = _.get(req, 'body.emails');
        logger.debug('Extracting details for ' + emails);
        try {

            let users_info = await DrupalAccess.get_user_by_email(emails);
            return res.status(200).json(users_info);
        }
        catch (err) {
            return next(err);
        }
    }
}

/**
 * Export singleton
 * @type {AuthController}
 */
module.exports = new AuthController();
