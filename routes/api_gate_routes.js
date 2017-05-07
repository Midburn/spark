var express = require('express');
var router = express.Router({
    mergeParams: true
});
var _ = require('lodash');

var drupalSync = require('../scripts/drupal_ticket_sync');

var Ticket = require('../models/ticket').Ticket;
var Event = require('../models/event').Event;

async function getTicketBySearchTerms(req, res) {

    // Loading event and checking that gate_code is valid.
    let event = null;
    let event_id = null;
    if (req.body.gate_code) {
        event = await Event.forge({gate_code: req.body.gate_code}).fetch();
        event_id = event.attributes.event_id;
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
        searchTerms = {event_id: event_id, barcode: req.body.barcode};
    } else if (req.params.ticket && req.params.order) {
        searchTerms = {event_id: event_id, ticket: req.body.ticket, order: req.body.order};
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
    let ticket = await Ticket.forge(searchTerms).fetch({withRelated: ['holder', 'pools']});
    if (ticket) {
        return ticket;
    }
    else {
        return res.status(404).json({
            error: true,
            data: {
                message: "Ticket not found"
            }
        });
    }
}

router.post('/get-ticket/', async function (req, res) {
    try {
        // Loading ticket data from the DB.
        let ticket = await getTicketBySearchTerms(req, res);

        //TODO check if there are ticket pools for this ticket and if yes - return them as well.

        let result = {
            ticket_number: ticket.attributes.ticket_number,
            holder_name: ticket.relations.holder.fullName,
            type: ticket.attributes.type,
            first_entrance_timestamp: ticket.attributes.first_entrance_timestamp
        };
        // All done, sending the results.
        res.status(200).json({
            error: false,
            data: {
                ticket: result
            }
        });
    }
    catch (err) {
        res.status(500).json({
            error: true,
            data: {
                message: "Internal error: " + err.message
            }
        });
    }
});

router.post('/gate-enter', async function (req, res) {

    // Loading ticket data from the DB.
    let ticket = await getTicketBySearchTerms(req, res);

    if (ticket.attributes.inside_event) {
        return res.status(500).json({
            error: true,
            data: {
                message: "Burner is already inside the event"
            }
        });
    }

    // Finding the right ticket_in_ticket_pool and updating it.
    let poolUpdated = false;
    if (req.body.pool_id) {
        _.each(ticket.relations.poolsM2M, async poolM2M => {
            if (poolM2M.attributes.pool_id === req.body.pool_id) {
                // Check the pool's quota
                if (poolM2M.quotaReached) {
                    return res.status(500).json({
                        error: true,
                        data: {
                            message: "Ticket pool quota reached"
                        }
                    });
                }
                // Everything is OK, updating the pool.
                else {
                    poolM2M.attributes.entrance_timestamp = new Date();
                    // Check if the user was here before, reuse this entry.
                    if (poolM2M.attributes.entrance_timestamp && poolM2M.attributes.exit_timestamp) {
                        poolM2M.attributes.exit_timestamp = null;
                    }
                    await poolM2m.save();
                    poolUpdated = true;
                }
            }
        });
    }

    // If entrance requested with a pool but the pool was not found.
    if (req.body.pool_id && !poolUpdated) {
        return res.status(500).json({
            error: true,
            data: {
                message: "Ticket is not assigned to this ticket pool"
            }
        });
    }

    // Saving the entrance.
    ticket.attributes.first_entrance_timestamp = new Date();
    ticket.attributes.inside_event = true;
    await ticket.save();

    // PATCH - Notifying Drupal that this ticket is now non-transferable. Remove with Drupal.
    drupalSync.passTicket(ticket.attributes.barcode);

    return res.status(200).json({
        error: false,
        data: {
            message: "Ticket entered successfully"
        }
    });
});

router.post('/gate-exit', async function (req, res) {

    try {
        let ticket = await getTicketBySearchTerms(req, res);

        if (!ticket.attributes.inside_event) {
            return res.status(500).json({
                error: true,
                data: {
                    message: "Burner is not in the event"
                }
            });
        }

        _.each(ticket.relations.poolsM2M, async poolM2M => {
            if (poolM2M.attributes.entrance_timestamp && !attendance.attributes.exit_timestamp) {
                poolM2M.attributes.exit_timestamp = new Date();
                await poolM2M.save();
            }
        });

        ticket.attributes.inside_event = false;
        await ticket.save();

        return res.status(200).json({
            error: false,
            data: {
                message: "Ticket exit completed"
            }
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            data: {
                message: "Internal error: " + err.message
            }
        });
    }
})
;

router.post('/tickets-counter', function (req, res) {
    // TODO return the number of people inside the event. Parameter - event_code
});

module.exports = router;
