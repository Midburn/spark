///////////////////////////////////////////////////////////
//
// Synchronizes ticket data from drupal to Spark.
//
///////////////////////////////////////////////////////////

var request = require('request');
var parseStringSync = require('xml2js-parser').parseStringSync;
var mysql = require('mysql');
var dateFormat = require('dateformat');
var _ = require('lodash');
var db = require('../libs/db');
var bookshelf = db.bookshelf;

var User = require('../models/user.js').User;
var Ticket = require('../models/ticket.js').Ticket;

const DRUPAL_USERNAME = 'omerpines@hotmail.com';
const DRUPAL_PASSWORD = '123456';
const TICKETS_TYPE_IDS = [38, 39, 40];
const STATUS_COMPLETED = 'Completed';

const MYSQL_USERNAME = 'spark';
const MYSQL_PASSWORD = 'spark';
const MYSQL_HOST_NAME = 'localhost';
const MYSQL_DB_NAME = 'spark';

const TIME_SLOT = 15;           //1hr

const EVENT_ID = "MIDBURN_2017";

//var connection = mysql.createConnection({
//    host: MYSQL_HOST_NAME,
//    user: MYSQL_USERNAME,
//    password: MYSQL_PASSWORD,
//    database: MYSQL_DB_NAME
//});
//connection.connect();
//
//function r(options, stdCallback) {
//    request(options, function (error, response, body) {
//        return stdCallback(error, {response: response, body: body});
//    });
//}

function r(options) {
    return new Promise(resolve => {
        request(options, (error, response, body) => {
            resolve({response: response, body: body});
        });
    });
}

async function getDrupalSession(callback) {
    var headers = {
        'content-type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache'
    };

    var options = {
        url: 'http://profile-test.midburn.org/en/api/user/login',
        method: 'POST',
        headers: headers,
        form: {'username': DRUPAL_USERNAME, 'password': DRUPAL_PASSWORD}
    };

    var x = await r(options);//WAIT
    if (x.response && x.response.statusCode == 302) {
        var bodyJson = JSON.parse(x.body);
        session = {sessid: bodyJson["sessid"], session_name: bodyJson["session_name"]};
        console.log("session info:" + JSON.stringify(session));
        return session;
    }
    else {
        console.log("getting session key failed");
    }
    console.log("getDrupalSession - OUT");
}

async function dumpDrupalTickets(session, date, callback) {

    console.log("dumping tickets from:" + dateFormat(date, "yyyy-mm-dd hh:MM:ss"));

    var headers = {
        'cache-control': 'no-cache',
        'x-csrf-token': session.sessid,
        'Accept': '*/*',
        'cookie': session.session_name + "=" + session.sessid
    };

    var options = {
        url: 'http://profile-test.midburn.org/en/api/ticket_export',
        method: 'GET',
        headers: headers,
        qs: {changed: dateFormat(date, "yyyy-mm-dd%20hh:MM:ss")}
    };

    var x = await r(options);  //WAIT
    if (x.response && x.response.statusCode == 302) {
        var result = parseStringSync(x.body); //WAIT
        var tickets = result['result']['item'];
        console.log("got " + tickets.length + " tickets");
        var utickets = [];
        for (var ticket of tickets) {
            var status = ticket['Ticket_State'];
            var type_id = parseInt(ticket['ticket_registration_bundle']);
            //console.log("type", type_id, ticket['user_ticket_type_name'][[0]], status);
            if (status == STATUS_COMPLETED && TICKETS_TYPE_IDS.includes(type_id)) {
                var uticket = {};
                uticket['holder_email'] = ticket['Email'][0];
                uticket['buyer_email'] = ticket['Buyer_E_mail'][0];
                uticket['name'] = ticket['Name'][0];
                uticket['id'] = ticket['Docment_id'][0];
                uticket['order_id'] = ticket['users_ticket_registration_uid'][0];
                uticket['ticket_id'] = ticket['Ticket_number'][0];
                uticket['ticket_number'] = ticket['Ticket_number'][0];
                uticket['barcode'] = ticket['ticket_barcode'][0];
                uticket['document_id'] = ticket['Docment_id'][0];
                uticket['ticket_type'] = ticket['user_ticket_type_name'][0];
                utickets.push(uticket);
            }
        }
        return utickets;
        //callback(utickets)
    }
    else {
        console.log("getting ticket dump failed");
    }
}

async function updateAllTickets(tickets, callback) {
    console.log("need to update " + tickets.length + " tickets");
    var counter = 1;
    for (ticket of tickets) {
        //console.log("Updating ticket #", counter++);
        var order_id = ticket['order_id'];
        var ticket_id = ticket['ticket_id'];
        var barcode = ticket['barcode'];
        var email = ticket['holder_email'];
        console.log("Found ticket #", counter++, "- email:" + email + " orderId:" + order_id + " ticketId:" + ticket_id + " barcode:" + barcode);
        ticket = _.clone(ticket);
        await updateTicket(ticket);
        //await bookshelf.knex.destroy();
    }
}

async function updateTicket(ticket) {
    var holder_email = ticket['holder_email'];
    var order_id = ticket['order_id'];
    var ticket_id = ticket['ticket_id'];
    var barcode = ticket['barcode'];

    if (typeof ticket['barcode'] !== "string" || ticket['barcode'].length == 0) {
        console.log("No barcode for ticket", ticket_id, "user ", holder_email);
        return;
    }
    else {
        console.log("Updating ticket", ticket_id, "user ", holder_email);
    }

    try {
        var user = await User.forge({email: holder_email}).fetch();
        if (user == null) {
            // We need to create a new user...
            console.log("User", holder_email, "not found in Spark. Creating...");
            user = await User.forge({ //WAIT
                first_name: ticket["name"].split(' ')[0] || "",
                last_name: ticket["name"].split(' ')[1] || "",
                email: ticket["holder_email"],
                israeli_id: ticket["id"]
            }).save();

            console.log("User", ticket["holder_email"], "created!");
        }
        else {
            console.log("User", ticket["holder_email"], "exists.");

        }

        var sparkTicket = await Ticket.forge({ticket_id: ticket_id}).fetch();
        var saveOptions = {};
        if (sparkTicket != null) {
            console.log("Updating ticket", ticket_id);
        }
        else {
            console.log("Creating ticket", ticket_id);
            saveOptions = {method: 'insert'};
        }


        var holder_id = user.attributes.user_id;
        sparkTicket = Ticket.forge({
            event_id: EVENT_ID,
            holder_id: holder_id,
            barcode: barcode,
            order_id: order_id,
            ticket_id: ticket_id

        });

        await sparkTicket.save(null, saveOptions); //WAIT
        console.log("Ticket update success for ticket", ticket_id);
    }
    catch (err) {
        console.error("ERROR:", err);
    }
}

function sendPassTicketRequest(session, barcode) {
    var headers = {
        'cache-control': 'no-cache',
        'x-csrf-token': session["sessid"],
        'Accept': '*/*',
        'cookie': session["session_name"] + "=" + session["sessid"]
    };

    var options = {
        url: 'https://profile-test.midburn.org/en/api/ticket/' + barcode + '/pass',
        method: 'POST',
        headers: headers
    };
    console.log('Ticket passed:' + barcode);
    request(options, function (error, response, body) {
        parseString(body, function (err, result) {
            console.log(result['result'])
        });
    })
}

function passTicket(barcode) {
    getDrupalSession(function (session) {
        sendPassTicketRequest(session, barcode);
    });
}

async function syncTickets(callback) {

    try {

        console.log('Starting Tickets Update Process...');
        var session = await getDrupalSession(); //WAIT
        console.log('Got Drupal session...');
        var now = new Date();
        var date = now.setMinutes(now.getMinutes() - TIME_SLOT);
        //var tickets = wait.for(dumpDrupalTickets, session, date);
        var tickets = await dumpDrupalTickets(session, date);
        await updateAllTickets(tickets);
        console.log("Tickets Update Process COMPLETED");
        callback(null);
    }
    catch (err) {
        console.error("ERROR:", err);
        callback(err);
    }
}

syncTickets(() => {
    process.exit(0);
});

//activateTicket('006db47d8d98d4a1256c88ef9a01258a');
//setInterval(syncTickets, TIMEOUT);

