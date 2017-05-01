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

const FiveMinutes = 5*60*1000;
const OneHour = 60*60*1000;

const SessionCookieName = 'spark_session';
const Algorithm = 'HS256';
const TokenTTL = OneHour;
const TokenRenewalPeriod = FiveMinutes;

const cookieExtractor = req => {
    if (!_.isUndefined(req.cookies && req.cookies[SessionCookieName])) {
        return req.cookies[SessionCookieName];
    }
    return null;
};

const params = {
    secretOrKey: apiTokensConfig.token,
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeader()]),
    passReqToCallback: true,
    ignoreExpiration: true
};

const convertToSparkSession = user => {
    return {
        email:  _.get(user, 'attributes.email', '') || '',
        name:   _.get(user, 'attributes.name', '') || '',
        uid:    _.get(user, 'attributes.user_id', -1),
        exp:    Date.now() + TokenTTL,
        iat:    Date.now()
    };
};

const sign = session => jwt.encode(session, apiTokensConfig.token, Algorithm);

const isExpired = session => session.exp < Date.now();
const isRenewable = session => (session.exp + TokenTTL + TokenRenewalPeriod) > Date.now();

module.exports = () => {
    const strategy = new Strategy(params, (req, payload, done) => {
        if (isExpired(payload)) {
            if (isRenewable(payload)) {
                req.sparkSessionRenew = true;
            } else {
                return done(null, false);
            }
        }

        req.sparkSession = payload;
        return done(null, payload);
    });
    passport.use(strategy);
    return {
        initialize: () => passport.initialize(),
        authenticate: () => passport.authenticate("jwt", { session: false }),
        login: (username, password) => {
            return users.login(username, password)
                        .then(convertToSparkSession)
                        .then(sign)
        },
        sign: sign,
        SessionCookieName: SessionCookieName,
        TokenTTL: TokenTTL,
        TokenRenewalPeriod: TokenRenewalPeriod
    };
};
