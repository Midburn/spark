var csurf = require('csurf');
var csrfProtection = csurf({cookie: true});

// Route middleware to make sure a user is logged in
var isLoggedIn = function isLoggedIn(req, res, next) {

    // If user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        console.log('user logged in', req.user);
        return next();
    }
    else {
        console.log('user not logged in');
    }

    // If they aren't, redirect them to the login page. 'r' holds the return URL.
    res.redirect('/login?r=' + req.url);
};

var isAdmin = function isLoggedIn(req, res, next) {

    // If user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        console.log('user logged in', req.user);
        return next();
    }
    else {
        console.log('user not logged in');
    }

    // If they aren't, redirect them to the login page. 'r' holds the return URL.
    res.redirect('/login?r=' + req.url);
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

module.exports.protectGet = isLoggedIn;

module.exports.protectPost = connectMiddleware([csrfProtection, isLoggedIn]);

// TODO admin role...
//module.exports.adminGet = connectMiddleware([isLoggedIn, ]);