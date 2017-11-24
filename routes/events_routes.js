const userRole = require('../libs/user_role');
// const constants = require('../models/constants');
// var Event = require('../models/event').Event;

module.exports = function (app, passport) {
   
    app.get('/:lng/events-admin', userRole.isLoggedIn(), (req, res) => {
        res.send('Events Index')
    });
    // Read
    app.get('/:lng/events-admin/:id', userRole.isLoggedIn(), (req, res) => {
        var event_id = req.params.id;
        res.send('Event details ' + event_id)
    });
    // new camp
    app.get('/:lng/events-admin/new', userRole.isAdmin(), (req, res) => {
        res.send('New Event')
    });
    // Edit
    app.get('/:lng/events-admin/:id/edit', userRole.isLoggedIn(), (req, res) => {
        var event_id = req.params.id;
        res.send('Edit event ' + event_id)
    });

};
