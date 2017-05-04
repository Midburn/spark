var express = require('express');
var router = express.Router({
    mergeParams: true
});

var userRole = require('../libs/user_role');
var security = require('../libs/security');

var Ticket = require('../models/ticket').Ticket;
var User = require('../models/user').User;
var Event = require('../models/event').Event;
var Attendance = require('../models/attendance').Attendance;

router.get('/', userRole.isLoggedIn(), function (req, res) {
    res.render('pages/gate');
});

router.get('/ajax/tickets', security.protectJwt, function (req, res) {
    var searchTerm = '';

    if (req.query.search) {
        searchTerm = req.query.search;

        // If not meeting a minimum length, return empty results.
        if (searchTerm.length < 2) {
            res.status(200).json({})
        }

        new Ticket().where('ticket_number', searchTerm)
            .orWhere('first_name', searchTerm)
            .orWhere('last_name', searchTerm)
            .orWhere('holder_email', searchTerm)
            .fetchAll().then((tickets) => {
            res.status(200).json({rows: tickets.toJSON(), total: tickets.length})
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    }
    else {
        res.status(200).json({});
    }
});

module.exports = router;
