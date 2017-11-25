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



    // Read
    app.get('/:lng/events-admin/:id', userRole.isLoggedIn(), (req, res) => {
        // var event_id = req.params.id;
        // res.send('Event details ' + event_id)
        // res.send('New Event');
        // var isNew=(event_id === 'new');
        // req.breadcrumbs([{
        //     name: 'breadcrumbs.home',
        //     url: '/' + req.params.lng + '/home'
        // },
        // {
        //     name: 'camps:breadcrumbs.manage',
        //     url: '/' + req.params.lng + '/events-admin'
        // },
        // {
        //     name: 'camps:breadcrumbs.new',
        //     url: '/' + req.params.lng + '/events/new/?c=' + req.query.c
        // }]);

        // let prototype = constants.prototype_camps.THEME_CAMP.id;
        // let result = Camp.prototype.__parsePrototype(prototype, req.user);

        req.event = {
            'created_at': '01-01-2017',
            'main_contact': 'contact person',
            'moop': 'moop person',
            'safety': 'safety person',
            'entrance_quota': '999',
            'status': 'new',
            'camp_activity_time': '01-01-2000',
            'type': 'new Event type',
            'noise_level': '9999',
            'web_published': '0',
            'child_friendly': 'YES',
            //is not new - required
            'id': req.params.id,
            'previousEventId':'8888888',
            'event_desc_he': 'אירוע קיים',
            'event_desc_en': 'Exist Event',
            'event_name_he': 'שם אירוע קיים',
            'event_name_en': 'Exist event name',
            'startDate':'01-01-2000',
            'endDate':'31-12-2000',
            'startPresaleTickets':'10-10-1999',
            'endPresaleTickets':'20-10-1999',
            'communityCamps': true,
            'communityArtInstallation': false,
            'communityProdDep': true,
            'ticketsInfo':"{json}",
            'url':"www.someWebSite.com"     
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
    // new camp
    app.get('/:lng/events-admin/0', userRole.isAdmin(), (req, res) => {

    });
    // Edit
    app.get('/:lng/events-admin/:id/edit', userRole.isLoggedIn(), (req, res) => {
        var event_id = req.params.id;
        res.send('Edit event ' + event_id)
    });

};
