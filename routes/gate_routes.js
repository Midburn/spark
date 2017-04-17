var express = require('express');
var router = express.Router({
    mergeParams: true
});

var userRole = require('../libs/user_role');
//var i18next = require('i18next');
//var mail = require('../libs/mail');
//var log = require('../libs/logger.js')(module);
var security = require('../libs/security');

//var config = require('config');
//var serverConfig = config.get('server');

var Ticket = require('../models/ticket').Ticket;

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

        new Ticket().where('ticket_number', searchTerm).fetchAll().then((tickets) => {
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

router.post('/api/login', function (req, res) {

});

router.post('/api/logout', function (req, res) {

});

router.post('/api/get-ticket', function (req, res) {
    var searchTerms;
    if (req.params.barcode) {
        searchTerms = {barcode: req.params.barcode};
    } else if (req.params.ticket && req.params.order) {
        searchTerms = {ticket: req.params.ticket, order: req.params.order};
    }
    new Ticket(searchTerms).fetch().then((ticket) => {
        if (ticket.entrance_timestamp != null) {
            res.status(500).json({
                error: true,
                data: {
                    message: "Already entered"
                }
            });
        }
        else {
            res.status(200).json(ticket);
        }
    });
});

router.post('/api/validate-ticket', function (req, res) {

});

router.post('/api/counter', function (req, res) {

});

module.exports = router;
