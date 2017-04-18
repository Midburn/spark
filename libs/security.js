var passport = require('passport');
var csurf = require('csurf');
var csrfProtection = csurf({
    cookie: true
});

// Route middleware to make sure a user is logged in
var isLoggedIn = function (req, res, next) {

    if (req.isAuthenticated()) {
        // If user is authenticated in the session, carry on
        return next();
    } else {
        // If they aren't, redirect them to the login page. 'r' holds the return URL.
        res.redirect('/' + req.params.lng + '/login?r=' + req.url);
    }
};

var isLoggedInAdmin = function (req, res, next) {

    if (req.isAuthenticated()) {
        if (req.user.isAdmin) {
            return next();
        } else {
            res.sendStatus(403);
        }
    } else {
        // If they aren't, redirect them to the login page. 'r' holds the return URL.
        res.redirect('/en/login?r=' + req.url);
    }
};

var connectMiddleware = function (list) {
    return function (req, res, next) {
        (function iter(i) {
            var mid = list[i];
            if (!mid) return next();
            mid(req, res, function (err) {
                if (err) return next(err);
                iter(i + 1)
            })
        }(0))
    }
};

var isJwtLoggedIn = passport.authenticate('jwt', {session: false});

module.exports.protectGet = isLoggedIn;
module.exports.protectPost = connectMiddleware([csrfProtection, isLoggedIn]);
module.exports.protectAdminGet = isLoggedInAdmin;
module.exports.protectJwt = isJwtLoggedIn;
