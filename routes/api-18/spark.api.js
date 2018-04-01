const Router = require('express').Router,
    routers = require('./routers'),
    constants = require('../../models/constants'),
    helperService = require('./services').helperService;

/**
 * Main Router for entire api.
 */
class SparkApi {
    constructor() {
        // TODO - here you can set prefixs for entire api + versions.
        this.router = Router();
        this.initMiddlewares();
        this.initRouters();
        /**
         * Error middleware - catch all `next(Error)` in a single place
         * keep this as the last middleware (and after all routes)
         */
        this.router.use(helperService.initForbiddenMiddleware());
    }

    initMiddlewares() {
        /**
         * Here you can set middlewares for entire api.
         */
    }

    initRouters() {
        console.log('Starting all routers')
        /**
         * Init the different routers.
         * Prefixs and order are important
         */
        this.router.use('', routers.mainRouter.router);
        this.router.use(constants.ROUTER_PREFIXES.EVENTS, routers.eventsRouter.router);
        this.router.use(constants.ROUTER_PREFIXES.CAMPS, routers.campsRouter.router);
        this.router.use(constants.ROUTER_PREFIXES.USERS, routers.usersRouter.router);
    }
}

/**
 * Export singleton
 * @type {SparkApi}
 */
module.exports = new SparkApi();
