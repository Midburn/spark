///////////////////////////////////////////////////////////
//
// Synchronizes ticket data from drupal to Spark.
//
///////////////////////////////////////////////////////////

var request = require('request');
var dateFormat = require('dateformat');
var _ = require('lodash');
var log = require('../libs/logger')(module);
const constants = require('../models/constants')

var User = require('../models/user.js').User;
var Ticket = require('../models/ticket.js').Ticket;

const EVENT_ID = constants.DEFAULT_EVENT_ID
const TICKETS_TYPE_IDS = [...constants.events[constants.DEFAULT_EVENT_ID].bundles]
var globalMinutesDelta = 0;

function r(options) {
    return new Promise(resolve => {
        request(options, (error, response, body) => {
            resolve({response: response, body: body, error: error});
        });
    });
}

async function getDrupalSession(callback) {
    var headers = {
        'content-type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache'
    };

    var options = {
        url: process.env.DRUPAL_PROFILE_API_URL + '/en/api/user/login',
        method: 'POST',
        headers: headers,
        form: {'username': process.env.DRUPAL_PROFILE_API_USER, 'password': process.env.DRUPAL_PROFILE_API_PASSWORD}
    };

    log.info("Calling", options.url);
    var x = await r(options);
    if (x.response) {
        try {
            var bodyJson = JSON.parse(x.body);
        }
        catch (err) {
            log.warn("Unable to parse JSON while trying to get a drupal session", x.body);
            return;
        }
        session = {sessid: bodyJson["sessid"], session_name: bodyJson["session_name"]};
        log.info("Session info:" + JSON.stringify(session));
        return session;
    }
    else {
        log.warn("Getting Drupal session key failed");
    }
}

async function dumpDrupalTickets(session, date, page) {

    log.info("Dumping tickets changed after", dateFormat(date, "yyyy-mm-dd hh:MM:ss"));

    var headers = {
        'cache-control': 'no-cache',
        'x-csrf-token': session.sessid,
        'Accept': '*/*',
        'cookie': session.session_name + "=" + session.sessid
    };

    var options = {
        url: process.env.DRUPAL_PROFILE_API_URL + '/en/api/ticket_export',
        method: 'GET',
        headers: headers,
        qs: {
            changed: dateFormat(date, "yyyy-mm-dd hh:MM:ss"),
            //ticket_state_target_id: 3,
            page: page
        }
    };

    var x = await r(options);
    if (x.response) {

        var tickets = JSON.parse(x.body);

        if (!tickets) {
            log.info("Didn't get ticket updates from Drupal");
            return null;
        }
        log.info("got " + tickets.length + " tickets");
        var utickets = [];

        for (var ticket of tickets) {
            var status = ticket['Ticket State'];
            
            var type_id = parseInt(ticket['ticket_registration_bundle']);
            //log.debug("type", type_id, ticket['user_ticket_type_name'][[0]], status);
            if (TICKETS_TYPE_IDS.includes(type_id)) {
                utickets.push({
                    'id'              : ticket['Docment id'],
                    'passport_id'     : ticket['passport_id'],
                    'holder_email'    : ticket['Email'],
                    'buyer_email'     : ticket['Buyer E-mail'],
                    'first_name'      : ticket['First name'],
                    'last_name'       : ticket['Last name'],
                    'disabled_parking': parseInt(ticket['disabledParking']) === 1,
                    'order_id'        : ticket['Order id'],
                    'ticket_id'       : ticket['Ticket number'],
                    'ticket_number'   : ticket['Ticket number'],
                    'barcode'         : ticket['ticket barcode']['value'],
                    'ticket_type'     : ticket['user_ticket_type_name'],
                    'ticket_status'   : status
                });
            }
        }
        return utickets;
    }
    else {
        log.warn('Ticket dump failed');
    }
}

async function updateAllTickets(tickets) {
    log.info("need to update " + tickets.length + " tickets");
    var counter = 1;
    for (ticket of tickets) {
        //log.info("Updating ticket #", counter++);
        var order_id = ticket['order_id'];
        var ticket_id = ticket['ticket_id'];
        var barcode = ticket['barcode'];
        var email = ticket['holder_email'];
        log.info("Found ticket #", counter++, "- email:" + email + " orderId:" + order_id + " ticketId:" + ticket_id + " barcode:" + barcode);
        ticket = _.clone(ticket);
        await updateTicket(ticket);
    }
}

async function updateTicket(ticket) {
    const {
        first_name,
        last_name,
        holder_email,
        passport_id,
        order_id,
        ticket_id,
        barcode,
        ticket_type,
        ticket_status
    } = ticket;

    log.info('Updating ticket', ticket_id, 'user ', holder_email);

    try {
        var user = await User.forge({email: holder_email}).fetch();
        if (user == null) {
            // We need to create a new user...
            log.info('User', holder_email+' not Found in Spark. Creating...');
            if (passport_id.length === 0) {
                ticket['passport_id'] = '';
            }
            user = await User.forge({
                first_name: ''+first_name,
                last_name: ''+last_name,
                email: holder_email,
                israeli_id: ''+ticket['passport_id']
            }).save();

            log.info(`User ${ticket['holder_email']} created!`);
        }
        else {
            await user.save({
                first_name: ''+first_name,
                last_name: ''+last_name,
                israeli_id: ''+ticket['passport_id']
            });
            log.info(`User ${ticket['holder_email']} exists - updating.`);
        }

        var sparkTicket = await Ticket.forge({ticket_id: ticket_id}).fetch();
        var saveOptions = {};
        if (sparkTicket != null) {
            log.info('Updating ticket', ticket_id);
        }
        else {
            log.info('Creating ticket', ticket_id);
            saveOptions = {method: 'insert'};
        }

        let holder_id = user.attributes.user_id;
        sparkTicket = Ticket.forge({
            event_id: EVENT_ID,
            holder_id: holder_id,
            barcode: (typeof barcode !== 'string' || barcode.length === 0) ? null : barcode,
            order_id: order_id,
            ticket_id: ticket_id,
            type: ticket_type,
            disabled_parking: parseInt(ticket.disabled_parking, 10) === 1,
            ticket_number: ticket_id, // In Drupal, they are the same
            ticket_status: ticket_status
        });
        await sparkTicket.save(null, saveOptions);
        log.info('Ticket update success for ticket', ticket_id);
    }
    catch (err) {
        log.error('ERROR:', err);
    }
}

function sendPassTicketRequest(session, barcode) {
    const headers = {
        'cache-control': 'no-cache',
        'x-csrf-token': session['sessid'],
        'Accept': '*/*',
        'cookie': session["session_name"] + "=" + session["sessid"]
    };

    const options = {
        url: process.env.DRUPAL_PROFILE_API_URL + '/en/api/ticket/' + barcode + '/pass',
        method: 'POST',
        headers: headers
    };
    log.info('Passing ticket with barcode', barcode);
    request(options, function (error, response, body) {
        if (error) {
            log.error(error);
        }
        log.info(body['result'])
    })
}

async function passTicket(barcode) {
    let session = await getDrupalSession();
    sendPassTicketRequest(session, barcode);
}

async function syncTickets(fromDate, callback) {
    try {
        log.info('Starting Tickets Update Process...');
        let session = await getDrupalSession();
        if (session) {
            log.info('Got Drupal session...');
            let page = 0;
            let running = true;
            while (running) {
                log.info("Page:", page);
                let tickets = await dumpDrupalTickets(session, fromDate, page);
                if (tickets.length > 0) {
                    await updateAllTickets(tickets);
                    page++;
                }
                else {
                    log.info(`FINISH SYNC TICKETS page:${page}`);
                    running = false;
                }
            }
            log.info("Tickets Update Process COMPLETED at", dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss"));
        }
        callback(null);
    }
    catch (err) {
        log.error("ERROR:", err);
        callback(err);
    }
}

function syncTicketsLoop() {
    let timeoutMillis = globalMinutesDelta * 60 * 1000;
    let nextDate = new Date();
    nextDate.setMilliseconds(timeoutMillis);
    log.info("Next ticket sync scheduled to", dateFormat(nextDate, "yyyy-mm-dd hh:MM:ss"));
    setTimeout(() => {
        let now = new Date();
        fromDate = now.setMinutes(-globalMinutesDelta);
        fromDate = now.setSeconds(-10); // A few seconds overlap is always good.
        syncTickets(fromDate, syncTicketsLoop);
    }, timeoutMillis);
}

function runSyncTicketsLoop(minutesDelta) {
    log.info('First run, updating all tickets');
    globalMinutesDelta = minutesDelta;
    let now = new Date();
    const ONE_YEAR_IN_SECONDS = 525948;
    let fromDate = now.setMinutes(-ONE_YEAR_IN_SECONDS);
    syncTickets(fromDate, syncTicketsLoop);
}

module.exports = {
    syncTickets: syncTickets,
    passTicket: passTicket,
    runSyncTicketsLoop: runSyncTicketsLoop
};
