const config = require('config');
const Chance = require('chance');
const jwt = require('jwt-simple');
const apiTokensConfig = config.get('api_tokens');
const chance = new Chance();

const SessionCookieName = 'spark_session';
const UserLoginUrl = '/jwt-login';
const TestValidCredentials = {username: 'a', password: 'a'};

const withSessionCookie = sessionToken => [`${SessionCookieName}=${sessionToken}`];

const generateSessionCookie = () => {
    const session = {
        email: chance.email(),
        name: chance.word(),
        uid: chance.natural()
    };
    return withSessionCookie(jwt.encode(session, apiTokensConfig.token));
};

module.exports = {SessionCookieName, TestValidCredentials, UserLoginUrl, withSessionCookie, generateSessionCookie};
