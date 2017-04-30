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

const cookieExtractor = req => {
    console.log('cookieExtractor');
    if (!_.isUndefined(req.cookies[SessionCookieName])) {
        return req.cookies[SessionCookieName];
    }
    console.log('found nothing');
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
        uid:    _.get(user, 'attributes.user_id', -1)
    };
};

module.exports = () => {
    const strategy = new Strategy(params, (req, payload, done) => {
        console.log('xxxxxxxxxx');
        console.log(payload);
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
                        .then(session => jwt.encode(session, apiTokensConfig.token))
        }
    };
};
