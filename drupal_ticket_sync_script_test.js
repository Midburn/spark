var config = require('config');

var dts = require('./scripts/drupal_ticket_sync');

//var now = new Date();
//var fromDate = now.setMinutes(-1000);
//dts.syncTickets(fromDate, () => {
//    process.exit(0);
//});

//dts.passTicket('006db47d8d98d4a1256c88ef9a01258a');

dts.runSyncTicketsLoop(1);

