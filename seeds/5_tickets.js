const log = require('../libs/logger')(module);
const Ticket = require('../models/ticket').Ticket;

addTickets = function(tickets) {
    log.info('Creating tickets...');
    return Promise.all(tickets.map(createTicket))
        .catch((error) => {
            log.error('Spark encountered an error while seeding tickets:');
            log.error(error);
        });
};

const createTicket = (ticket) => {
    return new Ticket(ticket).save(null, {method: 'insert'});
};

module.exports = addTickets;
