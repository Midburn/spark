const Router = require('express').Router,
    constants = require('../../../models/constants'),
    eventsController = require('../controllers').eventsController,
    userRole = require('../../../libs/user_role'),
    helperService = require('../services').helperService;

class EventsRouter {
    constructor() {
        this.router = Router();
        this.prefix = constants.ROUTER_PREFIXES.EVENTS;
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
        this.router.route('').get(eventsController.getEvents);
    }

    initMiddlewares() {
        this.router.use(userRole.isLoggedIn());
    }
    initRoutes() {
        /**
         * Init the different paths for this router.
         */
        this.router.route('/reset')
            .post([userRole.isAdmin()], eventsController.resetEvent);

        this.router.route('/new')
            .post([userRole.isAllowNewCamp()], eventsController.addEvent);

        this.router.route('/update')
            .put([userRole.isAllowNewCamp()], eventsController.updateEvent);

        this.router.route('/:event_id').get(eventsController.getEvent);

        this.router.route('/:event/edit').put(eventsController.editingEvent);

        //change the current event id for camps manager or admin
        this.router.route('/change').post(eventsController.changeSessionEventId);
    }
}

/**
 * Export singleton
 * @type {EventsRouter}
 */
module.exports = new EventsRouter();
