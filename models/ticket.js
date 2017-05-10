var bookshelf = require('../libs/db').bookshelf;
var constants = require('./constants.js');
var User = require('./user').User;

var Ticket = bookshelf.Model.extend({
    tableName: constants.TICKETS_TABLE_NAME,
    idAttribute: 'ticket_id',

    holder: function () {
        return this.belongsTo(User, 'holder_id');
    },
    buyer: function () {
        return this.belongsTo(User, 'buyer_id');
    }
});

module.exports = {
    Ticket: Ticket
};
