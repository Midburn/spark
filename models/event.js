var bookshelf = require('../libs/db').bookshelf;
var bcrypt = require('bcrypt-nodejs');

var Event = bookshelf.Model.extend({
    tableName: constants.EVENTS_TABLE_NAME,
    idAttribute: 'event_id',

    generateGateCode: function (code) {
        this.attributes.password = bcrypt.hashSync(code, bcrypt.genSaltSync(8), null);
    }
});

module.exports = {
    Event: Event
};
