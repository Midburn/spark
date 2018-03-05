
var DrupalAccess = require('../../libs/drupal_access').DrupalAccess;
var log = require('../../libs/logger')(module);
var _ = require('lodash');
var config = require('config');
var apiTokensConfig = config.get('api_tokens');

async function profile_info(req, res) {
    let token = _.get(req, 'headers.token')
    if (apiTokensConfig.token !== token) {
        res.status(401)
            .jsonp({
                status: 'false',
                message: 'Invalid Token!',
            });
        return;
    }
    if (!req.body.emails) {
        res.status(200).json([]);
        return;
    }
    let emails = _.get(req, 'body.emails');
    log.debug('Extracting details for ' + emails);
    try {

        let users_info = await DrupalAccess.get_user_by_email(emails);
        res.status(200).json(users_info);
    }
    catch (err) {
        res.status(500).json({
            error: true,
            data: {
                message: err.message
            }
        });
    }
}

module.exports = function (app, passport) {

     //routes for searching users. probably should be moved...
    app.post('/volunteers/profiles/', profile_info);

}
