const Router = require('express').Router,
    constants = require('../../../models/constants'),
    userRole = require('../../../libs/user_role'),
    usersController = require('../controllers').usersController,
    helperService = require('../services').helperService;

class UsersRouter {
    constructor() {
        this.router = Router();
        this.prefix = constants.ROUTER_PREFIXES.USERS;
        this.initOpenRoutes();
        this.initMiddlewares();
        this.initRoutes();
        /**
         * Error middleware - catch all `next(Error)` in a single place
         * keep this as the last middleware (and after all routes)
         */
        this.router.use(helperService.errorMiddleware(this.prefix));
    }

    initOpenRoutes() {
        /**
         * These routes are logged before middleware (e.g loggedIn)
         */
        /**
         * API: (GET) return active user list.
         *  if req.user.isAdmin - return all users
         *  if req.user.isCampManager - return all users from all camps
         *  else return req.user
         * request => /users
         */
        this.router.route('')
            .get(usersController.getUsers);
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
        /**
         * API: (GET) get user by email
         * request => /users/:email
         */
        this.router.route('/:email')
            .get(usersController.getUserByEmail);
        this.router.route('/:user_id/join_details')
            .get(usersController.userJoinDetails);

    }
}

/**
 * Export singleton
 * @type {UsersRouter}
 */
module.exports = new UsersRouter();
