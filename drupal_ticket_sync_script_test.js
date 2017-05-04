////////////////////////////////////////////////////////////////////////////////////////////
// This file is here in order to test /scripts/drupal_ticket_sync.
// Useful for development and debugging.
//
// TODO Delete this file and the script when disconnecting from Drupal.
////////////////////////////////////////////////////////////////////////////////////////////

require('config');
var dts = require('./scripts/drupal_ticket_sync');

// Test 1 //
//var now = new Date();
//var fromDate = now.setMinutes(-1000);
//dts.syncTickets(fromDate, () => {
//    process.exit(0);
//});

// Test 2 //
//dts.passTicket('006db47d8d98d4a1256c88ef9a01258a');

// Test 3 //
dts.runSyncTicketsLoop(1);

