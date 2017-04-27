const _ = require('lodash');
const sparkExpressSession = require('../libs/spark-express-session');
const sparkExpressRequireLogin = require('../libs/spark-express-require-login');

module.exports = app => {
    sparkExpressRequireLogin.registerSessionReader(app);

    /**
     * API => [POST] /api/userlogin
     * params => username, password
     * usage sample => curl --data "username=Profile_Username&password=Profile_Password&token=Secret_Token" http://localhost:3000/api/userlogin
     */
    app.post('/jwt-login', async (req, res) => {
        if (_.has(req, 'sparkSession')) {
            console.log('user is already logged in');
            res.sendStatus(200);
        } else {
            const { username, password } = _.get(req, 'body', {username: '', password: ''});
            return sparkExpressSession.login(username, password)
                                      .then(session => {
                                          const token = sparkExpressSession.encryptAsMidburnSession(session);
                                          res.cookie(sparkExpressSession.SessionCookieName, token, { maxAge: 60 * 60 * 1000, httpOnly: true })
                                              .sendStatus(200);
                                      })
                                      .catch(() => res.sendStatus(401));
        }
    });
};

