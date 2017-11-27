const userRole = require('../libs/user_role');
// const constants = require('../models/constants');
// var Event = require('../models/event').Event;
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
                    'created_at': '01-01-2017',
                    'id': req.params.id,
                    'previousEventId': '8888888',
                    'gate_code': _.get(event.attributes, 'gate_code'),
                    'event_desc_he': _.get(event.attributes, 'name'),
                    'event_desc_en': _.get(event.attributes, 'name'),
                    'event_name_he': _.get(event.attributes, 'name'),
                    'event_name_en': _.get(event.attributes, 'name'),
                    'startDate': _.get(event.attributes, 'addinfo_json.startDate'),
                    'endDate': _.get(event.attributes, 'addinfo_json.endDate'),
                    'startPresaleTickets': _.get(event.attributes, 'addinfo_json.startPresaleTickets'),
                    'endPresaleTickets': _.get(event.attributes, 'addinfo_json.endPresaleTickets'),
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
