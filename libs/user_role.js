var userRole = new (require('connect-roles'))();

// pre-defined roles constants / shortcuts - to allow autocompletion and prevent unexpected errors

userRole.LOGGED_IN = 'logged in';
userRole.isLoggedIn = function() {return userRole.is(userRole.LOGGED_IN);};

userRole.ADMIN = 'admin';
userRole.isAdmin = function() {return userRole.is(userRole.ADMIN);};

// roles logic - this function determines which roles a specific request / user has

userRole.use(function(req, role) {
    if (req.isAuthenticated()) {
        if (req.user.isAdmin) {
            // admin user has all roles
            return true;
        } else {
            // normal authenticated user (not admin)
            // only logged in role is valid
            // all other roles return false (we don't have any other roles at the moment..)
            return (role == userRole.LOGGED_IN);
        }
    } else {
        // unauthenticated user
        // doesn't have any roles
        return false;
    }
});

module.exports = userRole;
