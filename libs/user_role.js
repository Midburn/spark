var userRole = new (require('connect-roles'))();

// pre-defined roles constants / shortcuts - to allow autocompletion and prevent unexpected errors

userRole.LOGGED_IN = 'logged in';
userRole.isLoggedIn = function () {
    return userRole.is(userRole.LOGGED_IN);
};

userRole.ADMIN = 'admin';
userRole.isAdmin = function () {
    return userRole.is(userRole.ADMIN);
};

userRole.CAMP_MANAGER = 'camp_manager';
userRole.isCampManager = function () {
    return userRole.is(userRole.CAMP_MANAGER);
};

userRole.isAllowToViewUser = function () {
    return (req, res, next) => {
        if (req.user && (req.user.isAdmin || req.params.id === req.user.id)) {
            next();
        }
        else {
            next('route'); //TODO: set redirect route
        }
    };
};

const ALLOW_NEW_CAMP_DATE = new Date(2017, 5, 1); //TODO: puth this in settings file - what is the date needs to be?
userRole.isAAllowNewCamp = function () {
    return (req, res, next) => {
        if (req.user && (req.user.isAdmin || (ALLOW_NEW_CAMP_DATE.getTime() - (new Date().getTime())) > 0)) {
            next();
        }
        else {
            next('route'); //TODO: set redirect route
        }
    };
};

const ALLOW_EDIT_CAMP_DATE = new Date(2017, 5, 1); //TODO: puth this in settings file - what is the date needs to be?
userRole.isAllowEditCamp = function () {
    return (req, res, next) => {
        if (req.user && (req.user.isAdmin || req.user.isCampManager && (req.params.id === req.user.campId) && (ALLOW_EDIT_CAMP_DATE.getTime() - (new Date().getTime())) > 0)) {
            next();
        }
        else {
            next('route'); //TODO: set redirect route
        }
    };
};

// roles logic - this function determines which roles a specific request / user has

userRole.use(function (req, role) {
    if (req.isAuthenticated()) {
        if (req.user.isAdmin) {
            // admin user has all roles
            return true;
        } else {
            // normal authenticated user (not admin)
            // has the logged in role
            // checks custom roles in user object
            return (role === userRole.LOGGED_IN || req.user.hasRole(role));
        }
    } else {
        // unauthenticated user
        // doesn't have any roles
        return false;
    }
});

module.exports = userRole;
