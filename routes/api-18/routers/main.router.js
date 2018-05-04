const Router = require('express').Router,
    userRole = require('../../../libs/user_role'),
    constants = require('../../../models/constants'),
    userController = require('../controllers').usersController,
    campsController = require('../controllers').campsController,
    authController = require('../controllers').authController,
    helperService = require('../services').helperService,
    campsService = require('../services').campsService;

/**
 * This is a general router without prefix.
 * All routes in here should probably move to correct business logic routes.
 */
class MainRouter {
    constructor() {
        this.router = Router();
        this.initOpenRoutes();
        this.initMiddlewares();
        this.initRoutes();
        /**
         * Error middleware - catch all `next(Error)` in a single place
         * keep this as the last middleware (and after all routes)
         */
        this.router.use(helperService.errorMiddleware());
    }
    initOpenRoutes() {
        /**
         * These routes are logged before middleware (e.g loggedIn)
         */
        /**
         * TODO - this route should move to a deticated auth router.
         * API: (POST)
         * request => /api/userlogin
         * params  => username, password, token
         * usage sample => curl --data "username=Profile_Username&password=Profile_Password&token=Secret_Token" http://localhost:3000/api/userlogin
         */
        this.router.route('/api/userlogin').post(authController.login);
        /**
         * API: (GET) return camp's contact person with:
         * name_en, name_he, email, phone
         * request => /camps_contact_person/:id
         */
        // TODO - who uses this route? - this should be under users/camps routes.
        this.router.route('/camps_contact_person/:id')
            .get(userController.getUserBasic);
        /**
         * TODO - this should move under camps prefix - who uses these api's
         * API: (GET) return camps list
         * request => /camps_open
         */
        this.router.route('/camps_all')
            .get([userRole.isAllowedToViewSuppliers()],
            (req, res) => campsService.retrieveDataFor(constants.prototype_camps.THEME_CAMP.id,req.user).then(result => res.status(result.status).json(result.data)));
        this.router.route('/prod_dep_all')
            .get(userRole.isProdDepsAdmin(),
            (req, res) => campsService.retrieveDataFor(constants.prototype_camps.PROD_DEP.id,req.user).then(result => res.status(result.status).json(result.data)));
        this.router.route('/art_all')
            .get(userRole.isAllowedToViewSuppliers(),
            (req, res) => campsService.retrieveDataFor(constants.prototype_camps.ART_INSTALLATION.id,req.user).then(result => res.status(result.status).json(result.data)));
        /**
         * TODO - this should move under camps prefix - who uses these api's
         * API: (GET) return camps list csv format
         * request => /camps_csv
         */
        this.router.route('/camps_csv/:ActionType').get(userRole.isAdmin(), campsController.getCampsCSV);
        /**
         * TODO - This is a good example - all api should be prefixed correctly, but until then this will be considerd as a general route.
         * API: (GET) return published camps, for specific event id
         * request => /api/v1/camps/published
         */
        this.router.route('/api/v1/camps/published').get(campsController.getPublishedCamps);
        /**
         * TODO - This should move to auth router..
         * API: (POST) return published camps, for specific event id
         * request => /volunteers/profiles/
         */
        this.router.route('/volunteers/profiles/').post(authController.getToken);
    }
    initMiddlewares() {
        /**
         * Don't use auth middleware on this entire route
         * Because it will catch 404 and all other (it's on the main route)
         */
    }

    initRoutes() {
        /**
         * Init the different paths for this router.
         */
        /**
         * TODO - this should move under camps prefix - who uses these api's
         * API: (GET) return camps list which are open to new members
         * request => /camps_open
         */
        this.router.route('/camps_open').get(userRole.isLoggedIn(), campsController.getOpenCamps);
        /**
         * TODO - this should move under users prefix - who uses these api's
         * Get users groups
         */
        this.router.route('/my_groups').get(userRole.isLoggedIn(), userController.getUsersGroups);
    }
}

/**
 * Export singleton
 * @type {MainRouter}
 */
module.exports = new MainRouter();
