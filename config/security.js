// Route middleware to make sure a user is logged in
module.exports.isLoggedIn =
    function isLoggedIn(req, res, next) {

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

