var express = require('express');
var router = express.Router({
    mergeParams: true
});

var knex = require('../libs/db').knex;
var userRole = require('../libs/user_role');
var Event = require('../models/event').Event;
var constants = require('../models/constants');

router.get('/', userRole.isGateManager(), function (req, res) {
    //TODO Temp MIDBURN2018, we need to add a global current-event selector.
    Event.forge({event_id: 'MIDBURN2018'}).fetch().then(event => {
        return res.render('pages/gate', {
            gate_code: event.attributes.gate_code
        });
    });
});

router.get('/ajax/tickets',
    [userRole.isGateManager()], async function (req, res) {
    if (req.query.search) {
        const MINIMUM_LENGTH = 3;

        // If not meeting a minimum length, return empty results.
        if (req.query.search.length < MINIMUM_LENGTH) {
            return res.status(200).json({rows: [], total: 0})
        }

        //TODO - Make this function load only the tickets of the current event dynamically, not from constant.
        let event = await Event.forge({event_id: constants.CURRENT_EVENT_ID}).fetch();
        let gate_status = event.attributes.gate_status;

        knex.select('*').from('tickets').leftJoin('users', 'tickets.holder_id', 'users.user_id')
            .where('ticket_number', isNaN(parseInt(req.query.search))? req.query.search: parseInt(req.query.search))
            .orWhere('first_name', 'LIKE', '%' + req.query.search + '%')
            .orWhere('last_name', 'LIKE', '%' + req.query.search + '%')
            .orWhere('email', 'LIKE', '%' + req.query.search + '%')
            .orWhere('israeli_id', 'LIKE', '%' + req.query.search + '%')
            .andWhere('event_id',constants.CURRENT_EVENT_ID)
            //.limit(parseInt(req.query.limit)).offset(parseInt(req.query.offset))
            .then((tickets) => {
                res.status(200).json({rows: tickets, total: tickets.length})
            }).catch((err) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message,
                        gate_status: gate_status
                    }
                });
            });
    }
    else {
        return res.status(200).json({rows: [], total: 0})
    }
});

module.exports = router;
