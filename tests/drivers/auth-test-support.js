const jwt = require('jwt-simple');
const config = require('config');
const apiTokensConfig = config.get('api_tokens');
const Chance = require('chance');
const chance = new Chance();

const SessionCookieName = 'spark_session';
const UserLoginUrl = '/jwt-login';
const TestValidCredentials = {username: 'a', password: 'a'};
const TestInvalidCredentials = {username: chance.word(), password: chance.word()};

const withSessionCookie = sessionToken => [`${SessionCookieName}=${sessionToken}`];

const generateSessionCookie = () => {
    const session = {
        email: chance.email(),
        name: chance.word(),
        uid: chance.natural()
    };
    return withSessionCookie(jwt.encode(session, apiTokensConfig.token));
};

const InvalidTokenCookie = withSessionCookie(jwt.encode(session, 'someotherpassword'));

module.exports = {SessionCookieName, InvalidTokenCookie, TestValidCredentials, TestInvalidCredentials, UserLoginUrl, withSessionCookie, generateSessionCookie};
