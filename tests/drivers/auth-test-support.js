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

const InvalidTokenCookie = withSessionCookie(jwt.encode(randomSession(), chance.word()));
const ExpiredTokenCookie = withSessionCookie(jwt.encode(randomSessionWithExpiration(Date.now() - 1), apiTokensConfig.token));

module.exports = {SessionCookieName, InvalidTokenCookie, ExpiredTokenCookie, TestValidCredentials, TestInvalidCredentials, UserLoginUrl, withSessionCookie, generateSessionCookie, generateSessionHeader};
