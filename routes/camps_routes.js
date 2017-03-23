const userRole = require('../libs/user_role');
const breadcrumbs = require('express-breadcrumbs');
// const constants = require('../models/constants.js');

var Camp = require('../models/camp').Camp;
var User = require('../models/user').User;

module.exports = function (app, passport) {
    // Breadcrumbs
    app.use(breadcrumbs.init());

    // ==============
    // Camps Routing
    // ==============
    // camps index page, create new camp
    app.get('/:lng/camps', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs({
            name: 'camps:breadcrumbs.home',
            url: '/' + req.params.lng + '/camps'
        });
        if (req.user.hasRole('admin')) {
            res.render('pages/camps/index_admin', {
                user: req.user,
                breadcrumbs: req.breadcrumbs()
            });
        } else if (req.user.hasRole('camp manager')) {
            /**
             * Add an API to get camp id by user id
             * then redirect to camp profile page.
             */
        } else {
            // Regular user
            res.render('pages/camps/index_user', {
                user: req.user,
                breadcrumbs: req.breadcrumbs()
            });
        }
    });

    // new camp
    app.get('/:lng/camps/new', userRole.isAdmin(), (req, res) => {
        req.breadcrumbs([{
            name: 'camps:breadcrumbs.home',
            url: '/' + req.params.lng + '/camps'
        },
        {
            name: 'camps:breadcrumbs.new',
            url: '/' + req.params.lng + '/camps/new/?c=' + req.query.c
        }]);
        res.render('pages/camps/new', {
            user: req.user,
            camp_name_en: req.query.c,
            breadcrumbs: req.breadcrumbs()
        });
    });
    // camps statistics
    app.get('/:lng/camps-stats', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'camps:breadcrumbs.home',
            url: '/' + req.params.lng + '/camps'
        },
        {
            name: 'camps:breadcrumbs.stats',
            url: '/' + req.params.lng + '/camps-stats'
        }]);
        res.render('pages/camps/stats', {
            user: req.user,
            breadcrumbs: req.breadcrumbs()
        });
    });
    // camps members board
    app.get('/:lng/camps-members', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'camps:breadcrumbs.home',
            url: '/' + req.params.lng + '/camps'
        },
        {
            name: 'camps:breadcrumbs.members',
            url: '/' + req.params.lng + '/camps-members'
        }]);
        res.render('pages/camps/members', {
            user: req.user,
            breadcrumbs: req.breadcrumbs()
        });
    });
    // camps documents
    app.get('/:lng/camps-docs', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'camps:breadcrumbs.home',
            url: '/' + req.params.lng + '/camps'
        },
        {
            name: 'camps:breadcrumbs.docs',
            url: '/' + req.params.lng + '/camps-docs'
        }]);
        res.render('pages/camps/docs', {
            user: req.user,
            breadcrumbs: req.breadcrumbs()
        });
    });
    /**
     * CRUD Routes
     */
    // Read
    app.get('/:lng/camps/:id', userRole.isLoggedIn(), (req, res) => {
        Camp.forge({
            id: req.params.id,
            // event_id: constants.CURRENT_EVENT_ID,
        }).fetch({
            // withRelated: ['details']
        }).then((camp) => {
            User.forge({
                user_id: camp.toJSON().main_contact
            }).fetch().then((user) => {
                res.render('pages/camps/camp', {
                    user: req.user,
                    id: req.params.id,
                    camp: camp.toJSON(),
                    details: camp.toJSON()
                });
            });
        }).catch((e) => {
            res.status(500).json({
                error: true,
                data: {
                    message: e.message
                }
            });
        });
    });
    // Edit
    app.get('/:lng/camps/:id/edit', userRole.isLoggedIn(), (req, res) => {
        Camp.forge({
            id: req.params.id,
            // event_id: constants.CURRENT_EVENT_ID,
        }).fetch({
            // withRelated: ['details']
        }).then((camp) => {
            var camp_data = camp.toJSON();
            if (camp_data.type===null) {
                camp_data.type = '';
            }
            res.render('pages/camps/edit', {
                user: req.user,
                camp: camp_data,
                details: camp_data
            })
        })
    });
    // Delete, make camp inactive
    app.get('/:lng/camps/:id/remove', userRole.isLoggedIn(), (req, res) => {
        Camp.forge({
            id: req.params.id
        }).fetch().then((camp) => {
            camp.save({
                status: 'inactive'
            }).then(() => {
                res.render('pages/camps/stats', {
                    user: req.user
                });
            }).catch(function (err) {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        });
    });
    // Destroy
    app.get('/:lng/camps/:id/destroy', userRole.isAdmin(), (req, res) => {
        Camp.forge({
            id: req.params.id
        }).fetch().then((camp) => {
            camp.destroy().then(() => {
                res.render('pages/camps/stats', {
                    user: req.user
                });
            }).catch(function (err) {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        });
    });
    // Test Route for New Camp Program
    // new Program
    app.get('/:lng/program', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs('camps-new_program');
        res.render('pages/camps/program', {
            user: req.user,
            camp_name_en: req.query.c
        });
    });
};
