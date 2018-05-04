const userRole = new (require('connect-roles'))();

// pre-defined roles constants / shortcuts - to allow autocompletion and prevent unexpected errors

userRole.LOGGED_IN = 'logged in';
userRole.isLoggedIn = function () {
    return userRole.is(userRole.LOGGED_IN);
};

userRole.ADMIN = 'admin';
userRole.isAdmin = function () {
    return userRole.is(userRole.ADMIN);
};

userRole.THEME_CAMPS_ADMIN = 'camps_admin';
userRole.isCampsAdmin = function () {
    return userRole.is(userRole.THEME_CAMPS_ADMIN) || userRole.is(userRole.ADMIN);
};
userRole.ART_INSTALLATION_ADMIN = 'art_installations_admin';
userRole.isArtInstallationsAdmin = function () {
    return userRole.is(userRole.ART_INSTALLATION_ADMIN) || userRole.is(userRole.ADMIN);
};
userRole.PROD_DEP_ADMIN = 'prod_deps_admin';
userRole.isProdDepsAdmin = function () {
    return userRole.is(userRole.PROD_DEP_ADMIN) || userRole.is(userRole.ADMIN);
};

userRole.CAMP_MANAGER = 'camp_manager';
userRole.isCampManager = function () {
    return userRole.is(userRole.CAMP_MANAGER);
};

userRole.NPO_MANAGER = 'npo_manager';
userRole.isNpoManager = function () {
    return userRole.is(userRole.NPO_MANAGER);
};

userRole.GATE_MANAGER = 'gate_manager';
userRole.isGateManager = function () {
    return userRole.is(userRole.GATE_MANAGER);
};

userRole.isAllowedToViewSuppliers = function () {
    return (req, res, next) => {
        const user = req.user;
        if (user.isAdmin || user.isCampManager || user.isGateManager || user.isCampsAdmin || user.isArtInstallationsAdmin) {
            next();
        } else {
            next('route'); //TODO: set redirect route
        }
    }
};

userRole.isAllowedToViewUser = function () {
    return (req, res, next) => {
        if (req.user && (req.user.isAdmin || req.params.id === req.user.id)) {
            next();
        }
        else {
            next('route'); //TODO: set redirect route
        }
    };
};

const ALLOW_NEW_CAMP_DATE = new Date(2017, 5, 1); //TODO: Should be per event, not a constant! move to the DB - what is the date needs to be?
userRole.isAllowNewCamp = function () {
    return (req, res, next) => {
        if (req.user && (req.user.isAdmin || (ALLOW_NEW_CAMP_DATE.getTime() - (new Date().getTime())) > 0)) {
            next();
        }
        else {
            next('route'); //TODO: set redirect route
        }
    };
};

const ALLOW_EDIT_CAMP_DATE = new Date(2017, 5, 1); //TODO: Should be per event, not a constant! move to the DB - what is the date needs to be?
userRole.isAllowEditCamp = function () {
    return (req, res, next) => {
        if (req.user && (req.user.isAdmin || req.user.isCampManager && /** (req.params.id === req.user.campId) &&**/ (ALLOW_EDIT_CAMP_DATE.getTime() - (new Date().getTime())) > 0)) {
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
