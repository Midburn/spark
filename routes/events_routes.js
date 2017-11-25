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
        var event_id = req.params.id;
        // res.send('Event details ' + event_id)
        // res.send('New Event');
        var isNew=(event_id === 'new');
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'camps:breadcrumbs.manage',
            url: '/' + req.params.lng + '/events-admin'
        },
        {
            name: 'camps:breadcrumbs.new',
            url: '/' + req.params.lng + '/events/new/?c=' + req.query.c
        }]);
        console.log('hello');
        console.log(req.event);
        console.log(req.Event);
        var event={
            
        };
        event.attributes.name_desc_he='';
        event.event_name_en='jfdddjf';
        // let prototype = constants.prototype_camps.THEME_CAMP.id;
        // let result = Camp.prototype.__parsePrototype(prototype, req.user);
        res.render('pages/events/edit', {
            event: req.event,
            
            user: req.user,
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
