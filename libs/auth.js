// auth.js
const passport = require("passport");
const passportJWT = require("passport-jwt");
const _ = require("lodash");
const users = require("./users");
const ExtractJwt = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;
const config = require('config');
const jwt = require('jwt-simple');
const apiTokensConfig = config.get('api_tokens');

const SessionCookieName = 'spark_session';
const Algorithm = 'HS256';

const cookieExtractor = req => {
    if (!_.isUndefined(req.cookies && req.cookies[SessionCookieName])) {
        return req.cookies[SessionCookieName];
    }
    return null;
};

const params = {
    secretOrKey: apiTokensConfig.token,
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeader()]),
    passReqToCallback: true
};

const convertToSparkSession = user => {
    return {
        email:  _.get(user, 'attributes.email', '') || '',
        name:   _.get(user, 'attributes.name', '') || '',
        uid:    _.get(user, 'attributes.user_id', -1)/*,
        exp:    new Date(Date.now() + 24*60*60*1000),
        iat:    Date.now()*/
    };
};

module.exports = () => {
    const strategy = new Strategy(params, (req, payload, done) => {
        req.sparkSession = payload;
        return done(null, payload);
    });
    passport.use(strategy);
    return {
        initialize: () => passport.initialize(),
        authenticate: () => passport.authenticate("jwt", { session: false }),
        login: (username, password) => {
            return users.login(username, password)
                        .then(user => convertToSparkSession(user))
                        .then(session => jwt.encode(session, apiTokensConfig.token, Algorithm))
        },
        SessionCookieName: SessionCookieName
    };
};
