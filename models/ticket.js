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
    },
    pools: function () {
        return this.belongsToMany(TicketPool).through(Attendance, 'ticket_id', 'ticket_id');
    },
    poolsM2M: function () {
        return this.hasMany(Attendance);
    }
});

var TicketPool = bookshelf.Model.extend({
    tableName: 'ticket_pools',
    idAttribute: 'pool_id',

    tickets: function () {
        return this.belongsToMany(Ticket).through(Attendance, 'pool_id', 'pool_id');
    },

    virtuals: {
        ticketsInsideCounter: function () {
            let insideCounter = 0;
            _.each(this.tickets, ticket => {
                if (ticket.attributs.inside_event) {
                    insideCounter++
                }
            });
            return insideCounter;
        },
        quotaReached: function () {
            return (this.ticketsInsideCounter >= this.attributes.entrance_quota);
        }

    }
});

var Attendance = bookshelf.Model.extend({
    tableName: 'tickets_in_ticket_pools',
    //idAttribute: null, // Bookshelf currently not support compound primary keys.
    idAttribute: ['pool_id. ticket_id'],

    pool: function () {
        return this.belongsTo(TicketPool, 'pool_id');
    }
});

module.exports = {
    Ticket: Ticket,
    TicketPool: TicketPool,
    Attendance: Attendance
};
