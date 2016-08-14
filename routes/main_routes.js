var security = require('../libs/security');

module.exports = function (app, passport) {

    // =====================================
    // INDEX PAGE (renders to login) =======
    // =====================================
    app.get('/', function (req, res) {
        res.redirect('/he');
    });

    app.get('/:lng/', function (req, res) {
        res.render('pages/login');
    });

    app.get('/:lng/home', security.protectGet, function (req, res) {
        res.render('pages/home', {user: req.user});
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    var loginPost = function (req, res, next) {
        passport.authenticate('local-login', {
            successRedirect: 'home',
            failureRedirect: 'login'
        }, function (err, user, info) {
            if (err) {
                return res.render('pages/login', {errorMessage: err.message});
            }

            if (!user) {
                return res.render('pages/login', {errorMessage: req.flash('error')});
            }
            return req.logIn(user, function (err) {
                if (err) {
                    return res.render('pages/login', {errorMessage: err.message});
                } else {
                    var r = req.body['r'];
                    if (r) {
                        return res.redirect(r);
                    }
                    else {
                        return res.redirect('home');
                    }
                }
            });
        })(req, res, next);
    };

    // process the login form
    app.post('/:lng/login', loginPost);

    // show the login form
    app.get('/:lng/login', function (req, res) {
        var r = req.query.r;
        console.log(r);
        res.render('pages/login', {errorMessage: req.flash('error'), r: r});
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    var signUpPost = function (req, res, next) {
        passport.authenticate('local-signup', {
            successRedirect : 'profile', // redirect to the secure profile section
            failureRedirect : 'signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }, function (err, user, info) {
            if (err) {
                return res.render('pages/signup', {errorMessage: err.message});
            }

            if (!user) {
                return res.render('pages/signup', {errorMessage: req.flash('error')});
            }

            return req.logIn(user, function (err) {
                if (err) {
                    return res.render('pages/signup', {errorMessage: req.flash('error')});
                } else {
                    // sign in the newly registered user
                    return loginPost(req, res, next);
                }
            });
        }) (req, res, next);
    };

    // show the signup form
    app.get('/:lng/signup', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('pages/signup', {errorMessage: req.flash('error')});
    });

    // process the signup form
    app.post('/:lng/signup', signUpPost);

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/:lng/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // RESET PASSWORD ======================
    // =====================================
    var resetPasswordPost = function (req, res, next) {
        // TODO - implement
        // Tutorial is here: http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
        // (start at the "forgot" stuff, login/out/sign are already implemented).

        res.render('pages/reset_password', {errorMessage: 'NOT IMPLEMENTED'});
    };

    app.get('/:lng/reset_password', function (req, res) {
        res.render('pages/reset_password', {errorMessage: req.flash('error')});
    });

    app.post('/:lng/reset_password', resetPasswordPost);
};
