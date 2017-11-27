var bookshelf = require('../libs/db').bookshelf;
var bcrypt = require('bcrypt-nodejs');
var constants = require('./constants.js');

var Event = bookshelf.Model.extend({
    tableName: constants.EVENTS_TABLE_NAME,
    idAttribute: 'event_id',

    generateGateCode: function (code) {
        this.attributes.password = bcrypt.hashSync(code, bcrypt.genSaltSync(8), null);
    },
    loadProps: function() {
        // this.attributes.json_data;
    }

}, {
    /**
     * Returns event by id if found in constants.events object
     * if the event does not exists it will return the database
     * version and save it locally to the constants
     * @param { String } id
     * @returns {Promise<any>}
     */
    get_event: function (id) {
        if (constants.events[id]) return Promise.resolve(constants.events[id]);

        return Event.where('event_id', id).fetch().then((response) => {
            if (response.attributes && response.attributes.addinfo_json) {
                constants.events[id] = {
                    props: JSON.parse(response.attributes.addinfo_json),
                    bundles: []
                };

                return constants.events[id];
            }

            return null;
        });
    }
});

module.exports = {
    Event: Event
};
