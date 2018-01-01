const userRole = require('../libs/user_role');
const Event = require('../models/event').Event;
const _ = require('lodash')

module.exports = function (app, passport) {

    app.get('/:lng/events-admin', userRole.isLoggedIn(), (req, res) => {
        // res.send('Events Index')
        res.render('pages/events/index', {
            t_prefix: 'events:'
        })
    });

    // new camp
    // need to be changed to /:lng/events-admin/edit
    // creating a new event is availble directly form the UI- green button
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
        Event.where({event_id: req.params.id}).fetch()
            .then((event) => {
                
                req.event = {
                    'event_id': req.params.id,
                    'ext_id_event_id': _.get(event.attributes, 'ext_id_event_id'),
                    'name': _.get(event.attributes, 'name'),
                    'gate_code': _.get(event.attributes, 'gate_code'),
                    'gate_status': _.get(event.attributes, 'gate_status'),
                    
                    'addinfo_json': JSON.parse(_.get(event.attributes, 'addinfo_json'))
                };
                res.render('pages/events/edit', {
                    event: req.event,
                    user: req.user,
                });
                    
            })
    });

    // Edit
    app.get('/:lng/events-admin/:id/edit', userRole.isLoggedIn(), (req, res) => {
        var event_id = req.params.id;
        res.send('Edit event ' + event_id)
    });
};
