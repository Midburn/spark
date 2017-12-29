
var DrupalAccess = require('../libs/drupal_access').DrupalAccess;
var log = require('../libs/logger')(module);
var _ = require('lodash');

async function profile_info(req, res) {
    if (!req.query.emails) {
        res.status(200).json([]);
        return;
    }
    let emails = _.get(req, 'query.emails').split(',');
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
    app.get('/volunteers/profiles/', profile_info);

}
