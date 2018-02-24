const Router = require('express').Router,
    userRole = require('../../libs/user_role'),
    constants = require('../../models/constants'),
    userController = require('../controllers').usersController,
    campsController = require('../controllers').campsController,
    helperService = require('../services').helperService,
    campsService = require('../services').campsService;

/**
 * This is a general router without prefix.
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
            .get([userRole.isCampsAdmin()],
            (req, res) => campsService.retrieveDataFor(constants.prototype_camps.THEME_CAMP.id,req.user).then(result => res.status(result.status).json(result.data)));
        this.router.route('/prod_dep_all')
            .get(userRole.isProdDepsAdmin(),
            (req, res) => campsService.retrieveDataFor(constants.prototype_camps.PROD_DEP.id,req.user).then(result => res.status(result.status).json(result.data)));
        this.router.route('/art_all')
            .get(userRole.isArtInstallationsAdmin(),
            (req, res) => campsService.retrieveDataFor(constants.prototype_camps.ART_INSTALLATION.id,req.user).then(result => res.status(result.status).json(result.data)));
        /**
         * TODO - this should move under camps prefix - who uses these api's
         * API: (GET) return camps list csv format
         * request => /camps_csv
         */
        this.router.route('/camps_csv/:ActionType').get(userRole.isAdmin(), campsController.getCampsCSV);

    }
    initMiddlewares() {
        this.router.use(userRole.isLoggedIn());
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
        this.router.route('/camps_open').get(campsController.getOpenCamps);
        /**
         * TODO - this should move under users prefix - who uses these api's
         * Get users groups
         */
        this.router.route('/my_groups').get(userController.getUsersGroups);
    }
}

/**
 * Export singleton
 * @type {MainRouter}
 */
module.exports = new MainRouter();
