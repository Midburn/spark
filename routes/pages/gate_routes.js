const express = require('express');
const router = express.Router({
    mergeParams: true
});
const knex = require('../../libs/db').knex;
const userRole = require('../../libs/user_role');
const Event = require('../../models/event').Event;
const constants = require('../../models/constants');

router.get('/', userRole.isGateManager(), function (req, res) {
    Event.forge({event_id: req.user.currentEventId}).fetch().then(event => {
        return res.render('pages/gate', {
            gate_code: event.attributes.gate_code,
            event_id: event.attributes.event_id
        });
    });
});

// Supplier entries management
router.get('/suppliers', userRole.isLoggedIn(), (req, res) => {
    req.breadcrumbs([{
        name: 'breadcrumbs.home',
        url: '/' + req.params.lng + '/home'
    }]);

    res.render('pages/suppliers/supplier-entries', {
        user: req.user,
        t_prefix: 'suppliers:',
        isAdmin: req.user.isAdmin,
        breadcrumbs: req.breadcrumbs()
    });
});

router.get('/ajax/tickets',
    [userRole.isGateManager()], async function (req, res) {

    const MINIMUM_LENGTH = 3;

    if (!req.query.search || req.query.search.length < MINIMUM_LENGTH) {
        // If not meeting a minimum length, return empty results.
        return res.status(200).json({rows: [], total: 0});
    }

    let event = await Event.forge({event_id: req.user.currentEventId}).fetch();
    let gate_status = event.attributes.gate_status;

    knex.select('*').from('tickets').leftJoin('users', 'tickets.holder_id', 'users.user_id')
        .where('event_id', req.user.currentEventId)
        .andWhere(function() {
            this.where('ticket_status', 'IN', [constants.TICKET_STATUSES.COMPLETED, constants.TICKET_STATUSES.ENTERED])
        })
        .andWhere(function () {
            this.where('ticket_number', isNaN(parseInt(req.query.search))? req.query.search: parseInt(req.query.search))
            .orWhere('first_name', 'LIKE', '%' + req.query.search + '%')
            .orWhere('last_name', 'LIKE', '%' + req.query.search + '%')
            .orWhere('email', 'LIKE', '%' + req.query.search + '%')
            .orWhere('israeli_id', 'LIKE', '%' + req.query.search + '%')
            //.limit(parseInt(req.query.limit)).offset(parseInt(req.query.offset))
        })
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
});

module.exports = router;
