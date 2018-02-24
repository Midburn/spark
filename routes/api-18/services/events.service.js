const logger = require('../../../libs/logger')(module),
    _ = require('lodash');

class EventsService {
    createEventFromReq(req) {
        const new_event = {
            event_id: _.get(req, 'body.event_id'),
            ext_id_event_id: _.get(req, 'body.ext_id_event_id'),
            addinfo_json: JSON.stringify(req.body.addinfo_json),
            name: req.body.addinfo_json.name_he + " " + req.body.addinfo_json.name_en,
            gate_code: _.get(req, 'body.gate_code'),
            gate_status: _.get(req, 'body.gate_status')
        };
        logger.debug('Event received ' + new_event);
        return new_event;
    }
}

/**
 * Export singleton
 * @type {EventsService}
 */
module.exports = new EventsService();
