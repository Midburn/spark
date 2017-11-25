const userRole = require('../libs/user_role');
// const constants = require('../models/constants');
// var Event = require('../models/event').Event;
const Event = require('../models/event').Event;

module.exports = function (app, passport) {

    app.get('/:lng/events-admin', userRole.isLoggedIn(), (req, res) => {
        // res.send('Events Index')
        res.render('pages/events/index', {
            t_prefix: 'events:'
        })
    });

    // new camp
    app.get('/:lng/events-admin/new', userRole.isAdmin(), (req, res) => {

        req.event = {};
        res.render('pages/events/edit', {
            event: req.event,
            user: req.user,
            isNew: true
        });
    });



    // Read
    app.get('/:lng/events-admin/:id', userRole.isLoggedIn(), (req, res) => {

        req.event = {
            'created_at': '01-01-2017',
            'id': req.params.id,
            'previousEventId': '8888888',
            'event_desc_he': 'אירוע קיים',
            'event_desc_en': 'Exist Event',
            'event_name_he': 'שם אירוע קיים',
            'event_name_en': 'Exist event name',
            'startDate': '01-01-2000',
            'endDate': '31-12-2000',
            'startPresaleTickets': '10-10-1999',
            'endPresaleTickets': '20-10-1999',
            'communityCamps': true,
            'communityArtInstallation': false,
            'communityProdDep': true,
            'ticketsInfo': "{json}",
            'url': "www.someWebSite.com"
        };

        res.render('pages/events/edit', {

            event: req.event,
            user: req.user,
            // isNew: true

            // camp_name_en: req.query.c,
            // breadcrumbs: req.breadcrumbs(),
            // camp: { type: '', id: 'new' },
            // details: {},
            // isAdmin: result.isAdmin,
            // isNew: true,
            // __groups_prototype: prototype,
            // t_prefix: result.t_prefix,
            // isArt: prototype === constants.prototype_camps.ART_INSTALLATION.id,
            // isCamp: prototype === constants.prototype_camps.THEME_CAMP.id,
            // isProd: prototype === constants.prototype_camps.PROD_DEP.id,
        });

    });

    // Edit
    app.get('/:lng/events-admin/:id/edit', userRole.isLoggedIn(), (req, res) => {
        var event_id = req.params.id;
        res.send('Edit event ' + event_id)
    });
};
