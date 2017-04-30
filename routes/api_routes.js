const _ = require('lodash');

const SessionCookieName = 'spark_session';

module.exports = (app, auth) => {
    /**
     * API => [POST] /api/userlogin
     * params => username, password
     * usage sample => curl --data "username=Profile_Username&password=Profile_Password&token=Secret_Token" http://localhost:3000/api/userlogin
     */
    app.post('/jwt-login', /*auth.authenticate(), */(req, res) => {
        if (_.has(req, 'sparkSession')) {
            console.log('user is already logged in');
            res.sendStatus(200);
        } else {
            const {username, password} = _.get(req, 'body', {username: '', password: ''});
            return auth.login(username, password)
                       .then(token => res.cookie(SessionCookieName, token, {maxAge: 60 * 60 * 1000, httpOnly: true})
                       .sendStatus(200))
                       .catch(() => res.sendStatus(401));
        }
    });
};

