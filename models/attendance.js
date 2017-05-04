var bookshelf = require('../libs/db').bookshelf;
var constants = require('./constants.js');
var User = require('./user').User;

var Attendance = bookshelf.Model.extend({
    tableName: 'attendances',
    idAttribute: ['ticket_pool', 'ticket_id']
});

// Create the model and expose it
module.exports = {
    Attendance: Attendance
};
