const express = require('express');
const router = express.Router({mergeParams: true});
const _ = require('lodash');
const log = require('../../libs/logger')(module);
const knex = require('../../libs/db').knex;
const drupalSync = require('../../scripts/drupal_ticket_sync');

const Ticket = require('../../models/ticket').Ticket;
const Event = require('../../models/event').Event;
const UsersGroup = require('../../models/user').UsersGroup;
const UsersGroupMembership = require('../../models/user').UsersGroupMembership;

const constants = require('../../models/constants');
const config = require('config');

const volunteersAPI = require('../../libs/volunteers')();
const ERRORS = {
    EVENT_ID_IS_MISSING: 'Missing Event ID',
    GATE_CODE_MISSING: 'gate_code is missing or incorrect',
    BAD_SEARCH_PARAMETERS: 'Search parameters are missing or incorrect. Please provide barcode or (ticket and order)',
    TICKET_NOT_FOUND: 'Ticket not found',
    ALREADY_INSIDE: 'Participant is already inside the event',
    QUOTA_REACHED: 'Users group quota reached',
    TICKET_NOT_IN_GROUP: 'Ticket is not assigned to this users group',
    USER_OUTSIDE_EVENT: 'Participant is outside of the event',
    EXIT_NOT_ALLOWED: 'Exit is not permitted after the event has started',
    INVALID_VEHICLE_DIRECTION: 'Please enter only in or out as the direction',
    EVENT_CLOSED: "Event is currently closed",
    INVALID_ENTRY_TYPE: 'Please enter only correct entry type (regular, early_arrival)',
    INCORRECT_FORCE_ENTRY_PASSWORD: 'Incorrect Force Entry password',
    TICKET_INCOMPLETE: 'Ticket is either canceled or in processing'
};

function _incorrect_force_entry_password(password) {
    return password !== config.get('gate').force_entry_pwd
}

function sendError(res, httpCode, errorCode, errorObj) {
    if (errorObj) {
        log.error(errorObj)
    }
    return res.status(httpCode).json({
        error: errorCode,
        message: (errorObj && errorObj.message ? "Internal error: " + errorObj.message : ERRORS[errorCode])
    });
}

async function getTicketBySearchTerms(req, res) {
    let event = null;
    let event_id = null;
    let gate_status = null;
    if (req.body.event_id) {
        event = await Event.forge({event_id: req.body.event_id}).fetch();
        event_id = event.attributes.event_id;
        gate_status = event.attributes.gate_status;
    }
    if (!req.body.event_id || !event) {
        throw new Error("EVENT_ID_IS_MISSING");
    }

    // Setting the search terms for the ticket.
    let searchTerms;
    if (req.body.barcode) {
        searchTerms = {event_id: event_id, barcode: req.body.barcode};
    } else if (req.body.ticket && req.body.order) {
        searchTerms = {event_id: event_id, ticket_id: req.body.ticket, order_id: req.body.order};
    }
    else {
        throw new Error("BAD_SEARCH_PARAMETERS");
    }

    // Loading data from the DB.
    var ticket = await Ticket.forge(searchTerms).fetch({withRelated: ['holder']});
    if (ticket) {
        return [ticket, gate_status];
    }
    else {
        throw new Error("TICKET_NOT_FOUND");
    }
}

router.post('/get-ticket/', async function (req, res) {
    try {
        // Loading ticket data from the DB.
        let [ticket, gate_status] = await getTicketBySearchTerms(req, res);

        if (!ticket) {
            return;
        }

        // Getting user groups.
        let groups = [];
        let holder = ticket.relations.holder;
        // await holder.fetch({withRelated: ['groups', 'groupsMembership']});
        await holder.fetch({withRelated: ['groups', 'camp_memberships']});
        // if (holder.relations.groupsMembership) {
        //     _.each(holder.relations.groupsMembership.models, groupMembership => {
        //         if (groupMembership.attributes.status === 'approved' ||
        //             groupMembership.attributes.status === 'approved_mgr') {
        //             groupsMembershipData.push(groupMembership.attributes.group_id);
        //         }
        //     })
        // }
        if (holder.relations.groups) {
            _.each(holder.relations.groups.models, group => {
                // if (groupsMembershipData.contains(group.attributes.group_id)) {
                if (group.attributes.event_id === req.body.event_id) {
                    groups.push({
                        id: group.attributes.group_id,
                        type: group.attributes.type,
                        name: group.attributes.name
                    });
                }
                // }
            });
        }

        if (holder.relations.camp_memberships) {
            _.each(holder.relations.camp_memberships.models, camp_membership => {
                let addinfo = JSON.parse(camp_membership.attributes.addinfo_json);
                let group = _.find(groups, g => g.id === camp_membership.attributes.camp_id);
                if (group && (addinfo && addinfo.early_arrival)) {
                    group.early_arrival = true;
                }
            });
        }

        let production_early_arrival = false;
        if (gate_status === 'early_arrival') {
            production_early_arrival = await volunteersAPI.hasEarlyEntry(holder.attributes.email);
            log.debug(`get-ticket - user ${holder.attributes.email} is a production volunteer`);
        }
        // Preparing result.
        let result = {
            ticket_number: ticket.attributes.ticket_number,
            order_id: ticket.attributes.order_id,
            holder_name: ticket.relations.holder.fullName,
            email: ticket.relations.holder.attributes.email,
            disabled_parking: ticket.attributes.disabled_parking,
            barcode: ticket.attributes.barcode,
            israeli_id: ticket.relations.holder.attributes.israeli_id,
            gender: ticket.relations.holder.attributes.gender,
            type: ticket.attributes.type,
            inside_event: ticket.attributes.inside_event,
            entrance_timestamp: ticket.attributes.entrance_timestamp ? ticket.attributes.entrance_timestamp.getTime() : null,
            first_entrance_timestamp: ticket.attributes.first_entrance_timestamp ? ticket.attributes.first_entrance_timestamp.getTime() : null,
            last_exit_timestamp: ticket.attributes.last_exit_timestamp ? ticket.attributes.last_exit_timestamp.getTime() : null,
            entrance_group_id: ticket.attributes.entrance_group_id,
            groups: groups,
            production_early_arrival: production_early_arrival

        };

        // All done, sending the result.
        res.status(200).json({
            ticket: result,
            gate_status: gate_status
        });
    }
    catch (err) {
        let status = err.message === 'TICKET_NOT_FOUND' ? 404 : 500;
        if (ERRORS[err.message]) {
            return sendError(res, status, err.message);
        }
        return sendError(res, status, null, err);
    }
});

router.post('/gate-enter', async function (req, res) {
    try {

        // Loading ticket data from the DB.
        let [ticket, gate_status] = await getTicketBySearchTerms(req, res);
        const isEarlyArrival = gate_status === "early_arrival";
        if (!ticket) {
            return sendError(res, 500, "TICKET_NOT_FOUND");
        }
        if (ticket.attributes.inside_event) {
            return sendError(res, 500, "ALREADY_INSIDE");
        }

        if (ticket.attributes.ticket_status !== constants.TICKET_STATUSES.COMPLETED &&
            ticket.attributes.ticket_status !== constants.TICKET_STATUSES.ENTERED) {
            return sendError(res, 500, "TICKET_INCOMPLETE");
        }

        if (req.body.force === "true") {
            let force_pwd = req.body.force_pwd;
            if (_incorrect_force_entry_password(force_pwd)) {
                return sendError(res, 500, "INCORRECT_FORCE_ENTRY_PASSWORD");
            }
            log.warn('Forced ticket entrance', ticket.attributes.ticket_number);
            ticket.attributes.forced_entrance = true;
            ticket.attributes.forced_entrance_reason = req.body.force_reason;
        }
        else {

            if (gate_status === "closed") {
                return sendError(res, 500, "EVENT_CLOSED");
            }

            let holder = ticket.relations.holder;
            if (isEarlyArrival)
            // Finding the right users group and updating it.
            {
                let production_early_arrival = false;
                production_early_arrival = await volunteersAPI.hasEarlyEntry(holder.attributes.email);
                log.debug(`get-ticket - user ${holder.attributes.email} is a production volunteer`);
                if (req.body.group_id) {
                    let group = await UsersGroup.forge({group_id: req.body.group_id}).fetch({withRelated: ['users']});

                    if (!group) {
                        return sendError(res, 500, "TICKET_NOT_IN_GROUP");
                    }

                    let groupMembership = await UsersGroupMembership.forge({group_id: req.body.group_id, user_id: ticket.attributes.holder_id}).fetch();

                    if (!groupMembership) {
                        return sendError(res, 500, "TICKET_NOT_IN_GROUP");
                    }

                    if (await group.quotaReached) {
                        return sendError(res, 500, "QUOTA_REACHED");
                    }
                }
                else if (!production_early_arrival)
                {
                    return sendError(res, 500, "TICKET_NOT_IN_GROUP");
                }
            }
        }

        // Saving the entrance.
        ticket.attributes.entrance_timestamp = new Date();
        ticket.attributes.entrance_group_id = req.body.group_id || null;
        ticket.attributes.last_exit_timestamp = null;
        ticket.attributes.inside_event = true;
        if (!ticket.attributes.first_entrance_timestamp) {
            ticket.attributes.first_entrance_timestamp = new Date();
        }
        await ticket.save();
        // We want to add to the counter based on entry type (we don't use await to not break ticketing due to counter errors...)
        const entryType = isEarlyArrival ? 'early_arrival' : 'regular';
        knex(constants.ENTRIES_TABLE_NAME).insert({timestamp: new Date(), direction: 'arrival', event_id: req.body.event_id, type: entryType})
            .catch(err => {
                log.warn('A ticket entry count failed', err);
            });
        // TODO PATCH - Notifying Drupal that this ticket is now non-transferable. Remove with Drupal.
        drupalSync.passTicket(ticket.attributes.barcode);

        return res.status(200).json({
            message: "Ticket entered successfully"
        });
    } catch (err) {
        let status = err.message === 'TICKET_NOT_FOUND' ? 500 : 404;
        if (ERRORS[err.message]) {
            return sendError(res, status, err.message);
        }
        return sendError(res, status, null, err);
    }
});

router.post('/gate-exit', async function (req, res) {

    try {
        let [ticket, gate_status] = await getTicketBySearchTerms(req, res);
        const isEarlyArrival = gate_status === "early_arrival";
        if (!ticket) {
            return sendError(res, 500, "TICKET_NOT_FOUND");
        }

        if (!ticket.attributes.inside_event) {
            return sendError(res, 500, "USER_OUTSIDE_EVENT");
        }

//         if (gate_status === "regular") {
//             //return sendError(res, 500, "EXIT_NOT_ALLOWED");
//         }

        // Saving the exit.
        ticket.attributes.inside_event = false;
        ticket.attributes.entrance_group_id = null;
        ticket.attributes.entrance_timestamp = null;
        ticket.attributes.last_exit_timestamp = new Date();
        await ticket.save();
        // We want to add to the counter based on entry type (we don't use await to not break ticketing due to counter errors...)
        const entryType = isEarlyArrival ? 'early_arrival' : 'regular';
        knex(constants.ENTRIES_TABLE_NAME).insert({timestamp: new Date(), direction: 'departure', event_id: req.body.event_id, type: entryType})
            .catch(err => {
                log.warn('A ticket entry count failed', err);
            });
        return res.status(200).json({
            message: "Ticket exit completed"
        });
    }
    catch (err) {
        let status = err.message === 'TICKET_NOT_FOUND' ? 404 : 500;
        if (ERRORS[err.message]) {
            return sendError(res, status, err.message);
        }
        return sendError(res, 500, null, err)
    }
})
;

router.post('/tickets-counter', async function (req, res) {

    if (!req.body.event_id) {
        return sendError(res, 500, "EVENT_ID_IS_MISSING");
    }
    let event_id = req.body.event_id;

    let count = await knex('tickets').count('inside_event').where('event_id', '=', event_id);
    return res.status(200).json(count);
});

router.post(
    '/vehicle-action/:event_id/:direction',
    async function (req, res) {
        if (!constants.ENTRY_DIRECTION.includes(req.params.direction)) {
            return sendError(res, 500, "INVALID_VEHICLE_DIRECTION");
        }
        try {
            await knex(constants.VEHICLE_ENTRIES_TABLE_NAME).insert({timestamp: new Date(), direction: req.params.direction, event_id: req.params.event_id});
            return res.status(200).json({
                message: "Vehicle action completed"
            });
        } catch (errorObj) {
            return sendError(res, 500, errorObj);
        }
    }
);

router.get(
    '/vehicle-counter/:event_id',
    async function (req, res) {
        try {
            let vehicleEntries = (await knex(constants.VEHICLE_ENTRIES_TABLE_NAME)
                    .where('direction', '=', 'arrival')
                    .where('event_id', '=', req.params.event_id)
                    .count()
            )[0]['count(*)'];

            let vehicleExits = (await knex(constants.VEHICLE_ENTRIES_TABLE_NAME)
                    .where('direction', '=', 'departure')
                    .where('event_id', '=', req.params.event_id)
                    .count()
            )[0]['count(*)'];
            return res.status(200).json({
                vehicleCount: vehicleEntries - vehicleExits,
            });
        } catch (errorObj) {
            return sendError(res, 500, errorObj);
        }
    }
);

router.get(
    '/all-vehicle-actions/:event_id/:dateFrom/:dateTo',
    async function (req, res) {
        try {
            let vehicleTimestamps = await knex(constants.VEHICLE_ENTRIES_TABLE_NAME)
                .where('event_id', '=', req.params.event_id)
                .where('timestamp', '>', new Date(parseInt(req.params.dateFrom)))
                .where('timestamp', '<', new Date(parseInt(req.params.dateTo)));
            return res.status(200).json({
                vehicleTimestamps: vehicleTimestamps
            });
        } catch (errorObj) {
            return sendError(res, 500, errorObj);
        }
    }
);

router.post(
    '/entry-action/:event_id/:direction',
    async (req, res) => {
        const direction = req.params.direction;
        let type = req.body.type || 'regular';
        if (!constants.ENTRY_DIRECTION.includes(direction)) {
            return sendError(res, 500, "INVALID_DIRECTION");
        }
        if (!type || !constants.ENTRY_TYPE.includes(type)) {
            return sendError(res, 500, "INVALID_ENTRY_TYPE");
        }
        try {
            await knex(constants.ENTRIES_TABLE_NAME).insert({timestamp: new Date(), direction, event_id: req.params.event_id, type});
            return res.status(200).json({
                message: "Entry action completed"
            });
        } catch (errorObj) {
            return sendError(res, 500, errorObj);
        }
    }
);

router.get(
    '/entry-counter/:event_id',
    async function (req, res) {
        try {
            const type = req.query.type;
            if (type && !constants.ENTRY_TYPE.includes(type)) {
                return sendError(res, 500, "INVALID_ENTRY_TYPE");
            }
            let entries = knex(constants.ENTRIES_TABLE_NAME)
                    .where('direction', '=', 'arrival')
                    .where('event_id', '=', req.params.event_id);
            let exits = knex(constants.ENTRIES_TABLE_NAME)
                .where('direction', '=', 'departure')
                .where('event_id', '=', req.params.event_id);
            if (type) {
                entries = entries.where('type', '=', type);
                exits = exits.where('type', '=', type);
            }
            entries = (await entries.count())[0]['count(*)'];
            exits = (await exits.count())[0]['count(*)'];
            return res.status(200).json({
                entryCount: entries - exits,
            });
        } catch (errorObj) {
            return sendError(res, 500, errorObj);
        }
    }
);

router.get(
    '/all-entries/:event_id/:dateFrom/:dateTo',
    async function (req, res) {
        try {
            const entries = await knex(constants.ENTRIES_TABLE_NAME)
                .where('event_id', '=', req.params.event_id)
                .where('timestamp', '>', new Date(parseInt(req.params.dateFrom)))
                .where('timestamp', '<', new Date(parseInt(req.params.dateTo)));
            return res.status(200).json({
                entries
            });
        } catch (errorObj) {
            return sendError(res, 500, errorObj);
        }
    }
);

module.exports = router;
