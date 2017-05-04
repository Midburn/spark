var express = require('express');
var router = express.Router({
    mergeParams: true
});

var userRole = require('../libs/user_role');
var security = require('../libs/security');
var drupalSync = require('../scripts/drupal_ticket_sync');

var Ticket = require('../models/ticket').Ticket;
var User = require('../models/user').User;
var Event = require('../models/event').Event;
var Attendance = require('../models/attendance').Attendance;

async function getTicketBySearchTerms(req, res) {
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
    let ticket = await Ticket.forge(searchTerms).fetch({withRelated: 'holder'});
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

        // Loading ticket data from the DB.
        let ticket = await getTicketBySearchTerms(req, res);

        //TODO check if there are ticket pools for this ticket and if yes - return them as well.

        let result = {
            ticket_number: ticket.attributes.ticket_number,
            holder_name: ticket.relations.holder.fullName,
            type: ticket.attributes.type,
            entrance_timestamp: ticket.attributes.entrance_timestamp
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
    let ticket = await getTicketBySearchTerms(req, res);
    let ticket_pool_id = req.body.ticket_pool_id;
    let ticket_id = ticket.attributes.ticket_id;

    // If this is a simple entrance and the user is already inside, return error.
    if (ticket.attributes.entrance_timestamp && typeof ticket_pool_id === 'undefined') {
        res.status(500).json({
            error: true,
            data: {
                message: "Ticket already used for this event"
            }
        });
    }

    let attendances = await Attendance.forge({ticket_id: ticket_id}).fetchAll();
    let emptyAttendances = {};
    let currentAttendance = null;

    // If we have attendances in the DB - The user was at the gate before, and we load the data about it.
    if (attendances && attendances.models.length > 0) {
        // Check all attendances in the DB.
        for (let counter in attendances.models) {
            //if (anAttendance.hasOwnProperty()) {
            let anAttendance = attendances.models[counter];
            let attendance_ticket_pool_id = anAttendance.attributes.ticket_pool_id;

            if ((anAttendance.attributes.entrance_timestamp && anAttendance.attributes.exit_timestamp) ||
                (!anAttendance.attributes.entrance_timestamp && !anAttendance.attributes.exit_timestamp)) {
                emptyAttendances[attendance_ticket_pool_id] = anAttendance;
            }
            else if (anAttendance.attributes.entrance_timestamp && !anAttendance.attributes.exit_timestamp) {
                currentAttendance = {ticket_pool_id: attendance_ticket_pool_id, attendance: anAttendance};
            }
            //}
        }

        if (currentAttendance) {
            res.status(500).json({
                error: true,
                data: {
                    message: "Ticket already used for this event"
                }
            });
        }
    }

    // If we need to use a ticket pool, we need to find / create and update the pool.
    if (ticket_pool_id) {

        // If this is the first entrance with a ticket pool, create a new attendance
        if (emptyAttendances.length === 0 || !emptyAttendances[ticket_pool_id]) {
            currentAttendance = Attendance.forge({
                ticket_id: ticket_id,
                ticket_pool_id: ticket_pool_id,
                entrance_timestamp: new Date()
            });
        }
        // Else - just get the correct attendance for this pool.
        else {
            currentAttendance = emptyAttendances[ticket_pool_id];
        }

        // Set entrance time.
        currentAttendance.attributes.entrance_timestamp = new Date();
        currentAttendance.attributes.exit_timestamp = null;

        // Now save.
        await currentAttendance.save();
    }

    ticket.attributes.entrance_timestamp = new Date();
    await ticket.save();

    res.status(200).json({
        error: false,
        data: {
            message: "Ticket passed successfully"
        }
    });

    // Notifying Drupal that this ticket is now non-transferable.
    drupalSync.passTicket(ticket.attributes.barcode);
});

router.post('/gate-exit', async function (req, res) {
    //TODO same as gate-enter but the other way round.
    res.status(500).json({
        error: "Not implemented"
    });
});

router.post('/tickets-counter', function (req, res) {
    // TODO return the number of people inside the event. Parameter - event_code
});

module.exports = router;
