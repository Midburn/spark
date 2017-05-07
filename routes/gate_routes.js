var express = require('express');
var router = express.Router({
    mergeParams: true
});
var knex = require('../libs/db').knex;

var userRole = require('../libs/user_role');
var security = require('../libs/security');

var Ticket = require('../models/ticket').Ticket;

router.get('/', userRole.isLoggedIn(), function (req, res) {
    res.render('pages/gate');
});

router.get('/ajax/tickets', security.protectJwt, function (req, res) {
    var searchTerm = '';

    if (req.query.search) {
        searchTerm = '%' + req.query.search + '%';

        // If not meeting a minimum length, return empty results.
        if (searchTerm.length < 2) {
            res.status(200).json({})
        }

        knex.select('*').from('tickets').leftJoin('users', 'tickets.holder_id', 'users.user_id')
            .where('ticket_number', req.query.search)
            .orWhere('first_name', 'LIKE', searchTerm)
            .orWhere('last_name', 'LIKE', searchTerm)
            .orWhere('email', 'LIKE', searchTerm)
            .then((tickets) => {
                    res.status(200).json({rows: tickets, total: tickets.length})
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
