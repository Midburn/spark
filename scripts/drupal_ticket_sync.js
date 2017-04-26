
///////////////////////////////////////////////////////////
//
// Synchronizes ticket data from drupal to Spark.
//
///////////////////////////////////////////////////////////

var request = require('request');
var parseString = require('xml2js').parseString;
var mysql = require('mysql');
var dateFormat = require('dateformat');

const DRUPAL_USERNAME = 'omerpines@hotmail.com';
const DRUPAL_PASSWORD = '123456';
const TICKETS_TYPE_IDS = [38, 39, 40];
const STATUS_COMPLETED = 'Completed';

const MYSQL_USERNAME = 'spark';
const MYSQL_PASSWORD = 'spark';
const MYSQL_HOST_NAME = 'localhost';
const MYSQL_DB_NAME = 'spark';

const SQL_SELECT_USER = "SELECT * FROM users WHERE email = ?";

const TIMEOUT = 2 * 60 * 1000;  //1 min
const TIME_SLOT = 15;           //1hr

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

function sendTicketsDumpRequest(session, date, callback) {

    console.log("dumping ticket from:" + dateFormat(date, "yyyy-mm-dd hh:MM:ss"));

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

function updateTickets(tickets, callback) {
    console.log("need to update " + tickets.length + " tickets");
    for (var ticket of tickets) {
        var order_id = ticket['order_id'];
        var ticket_id = ticket['ticket_id'];
        var barcode = ticket['barcode'];
        var email = ticket['email'];
        console.log("updating ticket. email:" + email + " orderId:" + order_id + " ticketId:" + ticket_id + " barcode:" + barcode);
        getUserId(ticket, updateTicket);
    }
}

function getUserId(ticket, callback) {
    var email = ticket['email'];
    connection.query(SQL_SELECT_USER, [email], function (err, rows) {
        if (err || rows.length != 1) {
            console.log("failed to get user Id for email:", email);
        }
        else {
            var user_id = rows[0]['user_id'];
            callback(user_id, ticket);
        }
    });
}

function updateTicket(user_id, ticket) {
    const SQL_UPDATE_TICKET = "UPDATE tickets SET user_id=?, barcode=? WHERE order_id=? AND ticket_id=?";
    connection.query(SQL_UPDATE_TICKET, [user_id, barcode, order_id, ticket_id], function (err, rows) {
        if (err) {
            console.log("ticket update failed", err);
        }
        else {
            console.log("ticket update success for ticket" + JSON.stringify(ticket));
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
        sendTicketsDumpRequest(session, date, function (tickets) {
            updateTickets(tickets);
        })
    })
}

//activateTicket('006db47d8d98d4a1256c88ef9a01258a');
syncTickets();
//setInterval(syncTickets, TIMEOUT);

