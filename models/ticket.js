//const common = require('../libs/common').common;
var bookshelf = require('../libs/db').bookshelf;
var constants = require('./constants.js');

var Ticket = bookshelf.Model.extend({
    tableName: constants.TICKETS_TABLE_NAME,
    idAttribute: 'ticket_id'
});

// Create the model and expose it
module.exports = {
    Ticket: Ticket,
    idAttribute: 'ticket_id'

};
