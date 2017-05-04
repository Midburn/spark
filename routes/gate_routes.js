var express = require('express');
var router = express.Router({
    mergeParams: true
});

var userRole = require('../libs/user_role');
//var i18next = require('i18next');
//var mail = require('../libs/mail');
//var log = require('../libs/logger.js')(module);
var security = require('../libs/security');
var drupalSync = require('../scripts/drupal_ticket_sync');

//var config = require('config');
//var serverConfig = config.get('server');

var Ticket = require('../models/ticket').Ticket;
var User = require('../models/user').User;
var Event = require('../models/event').Event;


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

router.post('/api/get-ticket/', async function (req, res) {
    try {
        // Loading event and checking that gate_code is valid.
        let event = null;
        if (req.body.gate_code) {
            event = await Event.forge({gate_code: req.body.gate_code}).fetch();
        }
        if (!req.body.gate_code || !event) {
            res.status(500).json({
                error: true,
                data: {
                    message: "gate_code is missing or incorrect"
                }
            });
        }

        // Setting the search terms for the ticket.
        let searchTerms;
        if (req.body.barcode) {
            searchTerms = {barcode: req.body.barcode};
        } else if (req.params.ticket && req.params.order) {
            searchTerms = {ticket: req.body.ticket, order: req.body.order};
        }
        else {
            res.status(500).json({
                error: true,
                data: {
                    message: "Search parameters are missing or incorrect. Please provide barcode or (ticket and order)"
                }
            });
        }

        // Loading data from the DB.
        let ticket = await Ticket.forge(searchTerms).fetch();
        if (ticket) {
            let user = await User.forge({user_id: ticket.attributes.holder_id}).fetch();
            if (user) {
                let result = {
                    ticket_number: ticket.attributes.ticket_number,
                    holder_name: user.fullName,
                    type: ticket.attributes.type,
                    entrance_timestamp: ticket.attributes.entrance_timestamp
                    //TODO add here more fields if the app needs it.
                };
                res.status(200).json({
                    error: false,
                    data: {
                        ticket: result
                    }
                });
            }
            else {
                res.status(500).json({
                    error: true,
                    data: {
                        message: "Unable to find the holder of this ticket"
                    }
                });
            }
        }
        else {
            res.status(404).json({
                error: true,
                data: {
                    message: "Ticket not found"
                }
            });
        }

    }
    catch (err) {
        res.status(500).json({
            error: true,
            data: {
                message: "Internal error: " + err.message
            }
        });
    }
    //if (ticket.entrance_timestamp != null) {
    //    res.status(500).json({
    //        error: true,
    //        data: {
    //            message: "Already entered"
    //        }
    //    });
    //}
    //else {
    //    res.status(200).json(ticket);
    //}
});

router.post('/api/ticket-pass', function (req, res) {
    //TODO implement
    var barcode = "TEMP";
    drupalSync.passTicket(barcode);
});

router.post('/api/counter', function (req, res) {

});

module.exports = router;
