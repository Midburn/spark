const jwt = require('jwt-simple');
const config = require('config');
const apiTokensConfig = config.get('api_tokens');
const Chance = require('chance');
const chance = new Chance();
const {SessionCookieName, TokenTTL, TokenRenewalPeriod} = require('../../libs/auth')();

const UserLoginUrl = '/jwt-login';
const TestValidCredentials = {username: 'a', password: 'a'};
const TestInvalidCredentials = {username: chance.word(), password: chance.word()};

const withSessionCookie = sessionToken => [`${SessionCookieName}=${sessionToken}`];
const withSessionHeader = sessionToken => [`JWT ${sessionToken}`];

const randomSessionWithExpiration = timestamp => {
    return {
        email: chance.email(),
        name: chance.word(),
        uid: chance.natural(),
        exp: timestamp
    }
};

const randomSession = () => randomSessionWithExpiration(Date.now() + (60 * 1000));

const generateSessionCookie = () => withSessionCookie(jwt.encode(randomSession(), apiTokensConfig.token));
const generateSessionHeader = () => withSessionHeader(jwt.encode(randomSession(), apiTokensConfig.token));
const generateSessionCookieWithExpiration = timestamp => withSessionCookie(jwt.encode(randomSessionWithExpiration(timestamp), apiTokensConfig.token));

const InvalidTokenCookie = withSessionCookie(jwt.encode(randomSession(), chance.word()));
const ExpiredTokenCookie = generateSessionCookieWithExpiration(Date.now() - (TokenTTL + TokenRenewalPeriod + 1));
const RenewableTokenCookie = generateSessionCookieWithExpiration(Date.now() - (TokenTTL + TokenRenewalPeriod - 2000));

module.exports = {withSessionCookie, generateSessionCookie, generateSessionHeader, generateSessionCookieWithExpiration, InvalidTokenCookie, ExpiredTokenCookie, TestValidCredentials, TestInvalidCredentials, RenewableTokenCookie, UserLoginUrl};
