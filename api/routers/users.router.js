const Router = require('express').Router,
    constants = require('../../models/constants'),
    userRole = require('../../libs/user_role'),
    usersController = require('../controllers').usersController,
    helperService = require('../services').helperService;

class UsersRouter {
    constructor() {
        this.router = Router();
        this.prefix = constants.ROUTER_PREFIXES.USERS;
        /**
         * Error middleware - catch all `next(Error)` in a single place
         * keep this as the last middleware (and after all routes)
         */
        this.router.use(helperService.errorMiddleware(this.prefix));
    }

    initMiddlewares() {
        this.router.use(userRole.isLoggedIn());
    }
    initRoutes() {
        /**
         * Init the different paths for this router.
         */
        /**
         * API: (GET) get user by id
         * request => /users/:id
         */
        this.router.route('/:id')
            .get([userRole.isAllowedToViewUser()], usersController.getUserById);

    }
}

/**
 * Export singleton
 * @type {UsersRouter}
 */
module.exports = new UsersRouter();
