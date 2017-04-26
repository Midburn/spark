const _ = require('lodash');
const midburnExpressSession = require('../libs/midburn-express-session');
const midburnExpressRequireLogin = require('../libs/midburn-express-require-login');

module.exports = app => {
    midburnExpressRequireLogin.registerSessionReader(app);

    /**
     * API => [POST] /api/userlogin
     * params => username, password
     * usage sample => curl --data "username=Profile_Username&password=Profile_Password&token=Secret_Token" http://localhost:3000/api/userlogin
     */
    app.post('/api/userlogin', async (req, res) => {
        if (_.has(req, 'midburnSession')) {
            console.log('user is already logged in');
            res.sendStatus(200);
        } else {
            const { username, password } = _.get(req, 'body', {username: '', password: ''});
            midburnExpressSession.loginToDrupal(username, password)
                                 .then(session => {
                                     const token = midburnExpressSession.encryptAsMidburnSession(session);
                                     res.cookie(midburnExpressSession.SessionCookieName, token, { maxAge: 60 * 60 * 1000, httpOnly: true })
                                        .sendStatus(200);
                                 })
                                 .catch(() => res.sendStatus(401));
        }
    });
};

