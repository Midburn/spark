const userRole = require('../libs/user_role');
const constants = require('../models/constants.js');
var Camp = require('../models/camp').Camp;
// var User = require('../models/user').User;
var __render_camp = function (camp, req, res) {
    var camp_id;
    if (['int', 'string'].indexOf(typeof camp) > -1) {
        camp_id = parseInt(camp);
    } else {
        camp_id = camp.id;
    }
    Camp.forge({
        id: camp_id,
        event_id: constants.CURRENT_EVENT_ID,
        __prototype: constants.prototype_camps.THEME_CAMP.id,
    }).fetch({}).then((camp) => {
        camp.getCampUsers((users) => {
            camp.init_t(req.t);
            // if user is camp_member, we can show all 
            // let _user = camp.isUserCampMember(req.user.id);
            let data = {
                user: req.user, //
                userLoggedIn: req.user.hasRole('logged in'), //
                id: camp_id, //
                camp: camp.toJSON(),
                breadcrumbs: req.breadcrumbs(),
                details: camp.toJSON(),
                isUserCampMember: (camp.isUserCampMember(req.user.id) || req.user.isAdmin),
                isUserInCamp: (camp.isUserCampMember(req.user.id) || req.user.isAdmin),
                main_contact: camp.isUserInCamp(camp.attributes.main_contact),
                moop_contact: camp.isUserInCamp(camp.attributes.moop_contact),
                safety_contact: camp.isUserInCamp(camp.attributes.moop_contact),
            };
            res.render('pages/camps/camp', data);

        }, req.t);
    }).catch((e) => {
        res.status(500).json({
            error: true,
            data: {
                message: e.message
            }
        });
    });
}

module.exports = function (app, passport) {
    // ==============
    // Camps Routing
    // ==============
    // camps index page, create new camp
    app.get('/:lng/camps', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'camps:breadcrumbs.join_camp',
            url: '/' + req.params.lng + '/camps'
        }]);
        req.user.getUserCamps((camps) => {
            if (req.user.attributes.camps.length === 0 || !req.user.attributes.camp_manager) {
                camp = req.user.attributes.camp;
                res.render('pages/camps/index_user', {
                    user: req.user,
                    camp: camp,
                    breadcrumbs: req.breadcrumbs()
                });
            } else {
                __render_camp(req.user.attributes.camp, req, res);
            }
        }, req.t);
    });
    // new camp
    app.get('/:lng/camps/new', userRole.isAdmin(), (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'camps:breadcrumbs.manage',
            url: '/' + req.params.lng + '/camps-admin'
        },
        {
            name: 'camps:breadcrumbs.new',
            url: '/' + req.params.lng + '/camps/new/?c=' + req.query.c
        }]);

        res.render('pages/camps/edit', {
            user: req.user,
            camp_name_en: req.query.c,
            breadcrumbs: req.breadcrumbs(),
            isNew: true,
            camp: { type: '', id: 'new' },
            details: {}
        });
    });
    // camps statistics
    app.get('/:lng/camps-stats', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'camps:breadcrumbs.manage',
            url: '/' + req.params.lng + '/camps-admin'
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
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'camps:breadcrumbs.manage',
            url: '/' + req.params.lng + '/camps-admin'
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
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'camps:breadcrumbs.manage',
            url: '/' + req.params.lng + '/camps-admin'
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
    // camps admin management panel
    app.get('/:lng/camps-admin', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'camps:breadcrumbs.manage',
            url: '/' + req.params.lng + '/camps-admin'
        }]);
        if (req.user.hasRole('admin')) {
            res.render('pages/camps/index_admin', {
                user: req.user,
                breadcrumbs: req.breadcrumbs()
            });
        } else {
            // user not admin
            res.render('pages/camps/index_user', {
                user: req.user,
                breadcrumbs: req.breadcrumbs()
            });
        }
    });
    /**
     * CRUD Routes
     */
    // Read
    app.get('/:lng/camps/:id', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'camps:breadcrumbs.my_camp',
            url: '/' + req.params.lng + '/camps'
        },
        {
            name: 'camps:breadcrumbs.camp_stat',
            url: '/' + req.params.lng + '/camps/' + req.params.id
        }]);

        __render_camp(req.params.id, req, res);
        // Camp.forge({
        //     id: req.params.id,
        //     event_id: constants.CURRENT_EVENT_ID,
        //     __prototype: constants.prototype_camps.THEME_CAMP.id,
        // }).fetch({
        //     // withRelated: ['details']
        // }).then((camp) => {
        //     camp.init_t(req.t);
        //     User.forge({
        //         user_id: camp.toJSON().main_contact
        //     }).fetch().then((user) => {
        //         res.render('pages/camps/camp', {
        //             user: req.user,
        //             userLoggedIn: req.user.hasRole('logged in'),
        //             id: req.params.id,
        //             camp: camp.toJSON(),
        //             breadcrumbs: req.breadcrumbs(),
        //             details: camp.toJSON()
        //         });
        //     });
        // }).catch((e) => {
        //     res.status(500).json({
        //         error: true,
        //         data: {
        //             message: e.message
        //         }
        //     });
        // });
    });
    // Edit
    app.get('/:lng/camps/:id/edit', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'camps:breadcrumbs.manage',
            url: '/' + req.params.lng + '/camps-admin'
        },
        {
            name: 'camps:breadcrumbs.edit',
            url: '/' + req.params.lng + '/camps/' + req.params.id + '/edit'
        }]);
        Camp.forge({
            id: req.params.id,
            // event_id: constants.CURRENT_EVENT_ID,
        }).fetch({
            // withRelated: ['details']
        }).then((camp) => {
            req.user.getUserCamps((camps) => {
                if (req.user.isManagerOfCamp(req.params.id) || req.user.isAdmin) {
                    var camp_data = camp.toJSON();
                    camp_data.type = (camp_data.type === null) ? '' : camp_data.type;
                    res.render('pages/camps/edit', {
                        user: req.user,
                        breadcrumbs: req.breadcrumbs(),
                        camp: camp_data,
                        details: camp_data,
                        isNew: false
                    });
                } else {
                    res.status(500).json({
                        error: true,
                        data: {
                            message: 'failed to edit camp'
                        }
                    });
                }
            });
        })
    });
    // Program
    app.get('/:lng/program', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs('camps-new_program');
        res.render('pages/camps/program', {
            user: req.user,
            camp_name_en: req.query.c
        });
    });
};
