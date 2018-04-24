const Router = require('express').Router,
    constants = require('../../../models/constants'),
    userRole = require('../../../libs/user_role'),
    campController = require('../controllers').campsController,
    helperService = require('../services').helperService;

class CampsRouter {
    constructor() {
        this.router = Router();
        this.prefix = constants.ROUTER_PREFIXES.CAMPS;
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
         * API: (GET) return camps list
         * request => /camps
         */
        this.router.route('').get(campController.getCamps);
        /**
         * API: (POST) create Program
         * request => /camps/program
         */
        this.router.route('/program').post((req, res) => {
            console.log('success');
            //TODO - WTF is this? Why? Should we kill it?
        });
    }
    initMiddlewares() {
        this.router.use(userRole.isLoggedIn());
    }

    initRoutes() {
        /**
         * Init the different paths for this router.
         */

        /**
         * API: (POST) create camp
         * request => /camps/new
         */
        this.router.route('/new')
            .post([userRole.isAllowNewCamp()], campController.createCamp);
        /**
         * API: (PUT) edit camp
         * request => /camps/1/edit
         */
        this.router.route('/:id/edit')
            .put(campController.editCamp);
        // PUBLISH
        this.router.route('/:id/publish')
            .put([userRole.isAdmin()], // userRole.isAllowEditCamp() is work-in-progress
                campController.updateCampPublishingStatus(true));
        // UNPUBLISH
        this.router.route('/:id/unpublish')
            .put([userRole.isAdmin()], // userRole.isAllowEditCamp() is work-in-progress
                campController.updateCampPublishingStatus(false));
        /**
         * Approve user request
         */
        this.router.route('/:camp_id/members/:user_id/:action')
            .get(campController.approveUserRequest);
        /**
         * Save camp files (POST)
         * Get camp files (GET)
         */
        this.router.route('/:camp_id/documents')
            .post(campController.documentCampFiles)
            .get(campController.getCampFiles);
        /**
         * Delete camp file
         */
        this.router.route('/:camp_id/documents/:doc_id/')
            .delete(campController.deleteCampFile);

        /**
         * API: (GET) return indication if camp exist, provide camp_name_en
         * request => /camps/<camp_name_en>
         */
        this.router.route('/:camp_name_en')
            .get(campController.isCampNameAvailable);

        /**
         * API: (GET) camp join request
         * params: camp_id
         * request => /camps/2/join
         */
        this.router.route('/:id/join')
            .get(campController.joinCampRequest);
        /**
         * API: (GET) return indication if camp exist, provide camp_name_en
         * request => /camps/<camp_name_en>
         */
        this.router.route('/:camp_name_en')
            .get(campController.isCampNameAvailable);

        /**
         * Deliver join request email to camp manager
         * @type {[type]}
         */
        this.router.route('/:id/join/deliver').all(campController.handleCampJoinProcess('join'));

        /**
         * User request to cancel camp-join request 'join_cancel'
         */
        this.router.route('/users/:id/join_cancel').get(campController.handleCampJoinProcess('join_cancel'));

        /**
         * User request to cancel camp-join pending 'join_mgr'
         */
        this.router.route('/users/:id/join_approve').get(campController.handleCampJoinProcess('join_mgr'));

        /**
         * API: (GET) return camp members without details
         * request => /camps/1/members/count
         */
        this.router.route('/:id/members/count')
            .get(campController.countCampMembers);

        /**
         * API: (GET) return camp members with details
         * request => /camps/1/members
         */
        this.router.route('/:id/members')
            .get(campController.getAllCampMembers);

        /**
         * API: (POST) camp manager send member join request
         * request => /camps/1/members/add
         */
        this.router.route('/:id/members/add')
            .post(campController.addUserAsMember);

        /**
         * API: (GET) return camp manager email
         * query user with attribute: camp_id
         * request => /camps/1/camp_manager
         */
        this.router.route('/:id/manager')
            .get(campController.getCampManager);

        /**
         * API: (POST) Delete camp
         * delete camp with attribute: camp_id
         * request => /camps/1/remove
         */
        this.router.route('/:id/remove')
            .post(userRole.isAdmin(), campController.deleteCamp);

        /**
         * API: (POST) Update camp pre-sale quota
         * update camp with attribute: camp_id
         * request => /camps/1/updatePreSaleQuota
         */
        this.router.route('/:id/updatePreSaleQuota')
            .post(userRole.isAdmin(), campController.updateCampPreSaleQuota);

        /**
         * API: (POST) Update camp early-arrivals quota
         * update camp with attribute: camp_id
         * request => /camps/1/updatePreSaleQuota
         */
        this.router.route('/:id/updateEarlyArrivalQuota')
            .post(userRole.isAdmin(), campController.updateEarlyArrivalQuota);

    }

}

/**
 * Export singleton
 * @type {CampsRouter}
 */
module.exports = new CampsRouter();
