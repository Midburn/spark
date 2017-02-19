var bookshelf = require('../../../libs/db').bookshelf;
var constants = require('./../../../models/constants.js');

var Payment = bookshelf.Model.extend({
    tableName: constants.PAYMENTS_TABLE_NAME,
    idAttribute: 'payment_id'
});

// Create the model and expose it
module.exports = {
    Payment: Payment
};

