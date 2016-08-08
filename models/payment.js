var bookshelf = require('../config/db').bookshelf;

var Payment = bookshelf.Model.extend({
    tableName: 'payments',
    idAttribute: 'payment_id'
});

// Create the model and expose it
module.exports = {
    Payment: Payment
};

