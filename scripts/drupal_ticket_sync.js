///////////////////////////////////////////////////////////
//
// Synchronizes ticket data from drupal to Spark.
//
///////////////////////////////////////////////////////////

var request = require('request');
var parseString = require('xml2js').parseString;
var mysql = require('mysql');
var dateFormat = require('dateformat');
var _ = require('lodash');

const DRUPAL_USERNAME = 'omerpines@hotmail.com';
const DRUPAL_PASSWORD = '123456';
const TICKETS_TYPE_IDS = [38, 39, 40];
const STATUS_COMPLETED = 'Completed';

const MYSQL_USERNAME = 'spark';
const MYSQL_PASSWORD = 'spark';
const MYSQL_HOST_NAME = 'localhost';
const MYSQL_DB_NAME = 'spark';

const TIMEOUT = 2 * 60 * 1000;  //1 min
const TIME_SLOT = 15;           //1hr

const EVENT_ID = "MIDBURN_2017";

var connection = mysql.createConnection({
    host: MYSQL_HOST_NAME,
    user: MYSQL_USERNAME,
    password: MYSQL_PASSWORD,
    database: MYSQL_DB_NAME
});
connection.connect();

function getDrupalSession(callback) {
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

    request(options, function (error, response, body) {
        if (response != undefined && response.statusCode == 302) {
            var bodyJson = JSON.parse(body);
            session = {'sessid': bodyJson["sessid"], 'session_name': bodyJson["session_name"]};
            console.log("session info:" + JSON.stringify(session));
            callback(session);
        }
        else {
            console.log("getting session key failed");
        }
    })
}

function dumpDrupalTickets(session, date, callback) {

    console.log("dumping tickets from:" + dateFormat(date, "yyyy-mm-dd hh:MM:ss"));

    var headers = {
        'cache-control': 'no-cache',
        'x-csrf-token': session["sessid"],
        'Accept': '*/*',
        'cookie': session["session_name"] + "=" + session["sessid"]
    };

    var options = {
        url: 'http://profile-test.midburn.org/en/api/ticket_export',
        method: 'GET',
        headers: headers,
        qs: {changed: dateFormat(date, "yyyy-mm-dd%20hh:MM:ss")}
    };

    request(options, function (error, response, body) {
        if (response != undefined && response.statusCode == 302) {
            parseString(body, function (err, result) {
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
                callback(utickets)
            });
        }
        else {
            console.log("getting ticket dump failed");
        }
    })
}

function updateAllTickets(tickets, callback) {
    console.log("need to update " + tickets.length + " tickets");
    for (var ticket of tickets) {
        var order_id = ticket['order_id'];
        var ticket_id = ticket['ticket_id'];
        var barcode = ticket['barcode'];
        var email = ticket['holder_email'];
        console.log("updating ticket. email:" + email + " orderId:" + order_id + " ticketId:" + ticket_id + " barcode:" + barcode);
        ticket = _.clone(ticket);
        updateTicket(ticket);
    }
}

function updateTicket(ticket) {
    var holder_email = ticket['holder_email'];
    var order_id = ticket['order_id'];
    var ticket_id = ticket['ticket_id'];
    var barcode = ticket['barcode'];

    if (ticket['barcode'] !== "string") {
        console.error("No barcode for ticket", ticket_id, "user ", holder_email);
        return;
    }
    else {
        console.log("Updating ticket", ticket_id, "user ", holder_email);
    }

    const SQL_SELECT_USER = "SELECT * FROM users WHERE email = ?";
    connection.query(SQL_SELECT_USER, [holder_email], function (err, rows) {
        if (err) {
            console.error("failed to load user:", holder_email);
        }
        else if (rows.length == 1) {
            var holder_id = rows[0]['user_id'];
            //INSERT INTO table (id, name, age) VALUES(1, "A", 19) ON DUPLICATE KEY UPDATE name="A", age=19
            const SQL_UPDATE_TICKET = "INSERT INTO tickets (event_id, holder_id, barcode, order_id, ticket_id) " +
                "values(?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE holder_id=?, barcode=?";
            connection.query(SQL_UPDATE_TICKET, [EVENT_ID, holder_id, barcode, order_id, ticket_id, holder_id, barcode], function (err, rows) {
                if (err) {
                    console.error("ticket update failed for ticket", ticket_id, err);
                }
                else {
                    console.log("ticket update success for ticket" + ticket_id);
                }
            });
        }
        else { // need to create a new user...
            console.log("User", holder_email, "not found in Spark. Creating...");
            var first_name = ticket["name"].split(' ')[0] || "";
            var last_name = ticket["name"].split(' ')[1] || "";
            connection.query("insert into users(first_name, last_name, email, israeli_id) values(?, ?, ?, ?, ?)",
                [ticket["name"], first_name, last_name, ticket["holder_email"], ticket["id"]], function (err, rows) {
                    if (err) {
                        console.error("User", ticket["holder_email"], "creation failed", err);
                    }
                    else {
                        console.log("User", ticket["holder_email"], "created!");
                    }
                });
        }
    });
}

function sendActivateTicketRequest(session, barcode) {
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
    console.log('Activating:' + barcode);
    request(options, function (error, response, body) {
        parseString(body, function (err, result) {
            console.log(result['result'])
        });
    })
}

function activateTicket(barcode) {
    getDrupalSession(function (session) {
        sendActivateTicketRequest(session, barcode);
    });
}

function syncTickets() {
    console.log('Starting Tickets Update Process...');
    getDrupalSession(function (session) {
        var now = new Date();
        var date = now.setMinutes(now.getMinutes() - TIME_SLOT);
        dumpDrupalTickets(session, date, function (tickets) {
            updateAllTickets(tickets);
        })
    })
}

//activateTicket('006db47d8d98d4a1256c88ef9a01258a');
syncTickets();
//setInterval(syncTickets, TIMEOUT);

