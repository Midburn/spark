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
const withSessionHeader = sessionToken => [`JWT ${sessionToken}`];

const randomSession = () => {
    return {
        email: chance.email(),
        name: chance.word(),
        uid: chance.natural()
    }
};

const generateSessionCookie = () => withSessionCookie(jwt.encode(randomSession(), apiTokensConfig.token));
const generateSessionHeader = () => withSessionHeader(jwt.encode(randomSession(), apiTokensConfig.token));

const InvalidTokenCookie = withSessionCookie(jwt.encode(randomSession(), chance.word()));

module.exports = {SessionCookieName, InvalidTokenCookie, TestValidCredentials, TestInvalidCredentials, UserLoginUrl, withSessionCookie, generateSessionCookie, generateSessionHeader};
