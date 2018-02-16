var bookshelf = require('../libs/db').bookshelf;
var constants = require('./constants.js');

var Suppliers = bookshelf.Model.extend({

    tableName: constants.SUPPLIERS_TABLE_NAME,
    idAttribute: 'supplier_id',
});

module.exports = {
    Suppliers: Suppliers
};
