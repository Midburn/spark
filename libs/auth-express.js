const auth = require('./auth')();
const unless = require('express-unless');

const devApi = path => path.startsWith('/dev');
const loginUrl = path => path.startsWith('/jwt-login') || path.endsWith('/login') || path.endsWith('/signup') || path === '/';
const staticContent = path => path.startsWith('/bower_components') || path.startsWith('/scripts');

const containLoginToken = req => (req.cookies && req.cookies[auth.SessionCookieName]) || (req.headers && req.headers['authorization']) || false;

const shouldProtectApi = req => staticContent(req.path) || devApi(req.path) || (loginUrl(req.path) && !containLoginToken(req));

module.exports = app => {
    app.use(auth.initialize());

    const authenticate = auth.authenticate();
    authenticate.unless = unless;

    app.use(authenticate.unless(req => shouldProtectApi(req)));

    return auth;
};
