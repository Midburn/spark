const logger = require('../../../libs/logger')(module),
    Event = require('../../../models/event').Event,
    _ = require('lodash'),
    eventsService = require('../services').eventsService;

class EventsController {

    constructor() {
        /**
         * Keep `this` reference
         */
        this.getEvents = this.getEvents.bind(this);
        this.addEvent = this.addEvent.bind(this);
        this.updateEvent = this.updateEvent.bind(this);
        this.getEvent = this.getEvent.bind(this);
        this.editingEvent = this.editingEvent.bind(this);
    }

    getEvent(req, res) {
        const event_id = req.params.event_id;
        Event.forge({event_id: event_id})
            .fetch()
            .then((event) => {
                let props = {};
                if (typeof event.attributes.json_data === 'string') {
                    props = JSON.parse(event.attributes.json_data);
                }
                for (const prop in props) {
                    event.attributes[prop] = props[prop];
                }
                logger.debug(event);
                return res.json({event: event});
            })
            .catch((err) => {
                /**
                 * Pass the error to be handled by the generic error handler
                 */
                return next(err);
            })
    }

    getEvents(req, res, next) {
        Event.fetchAll()
            .then((events) => {
                res.status(200).json(
                    {
                        events: events.toJSON()
                    }
                )
            })
            .catch((err) => {
                /**
                 * Pass the error to be handled by the generic error handler
                 */
                return next(err);
            });
    }

    addEvent(req, res, next) {
        const new_event = eventsService.createEventFromReq(req);
        Event.forge().save(new_event)
            .then(res.send(200))
            .catch((err) => {
                /**
                 * Pass the error to be handled by the generic error handler
                 */
                return next(err);
            });
    }

    updateEvent(req, res, next) {
        const new_event = eventsService.createEventFromReq(req);
        const event_id = new_event.event_id;
        Event.forge({event_id: event_id}).save(new_event)
            .then(res.send(200))
            .catch((err) => {
                /**
                 * Pass the error to be handled by the generic error handler
                 */
                return next(err);
            });
    }

    editingEvent(req, res) {
        // TODO - What is this? why? what? who?
        logger.debug('EventsAPI edit ' + _.get(req, 'params.event'));
    }

    changeCampEventId(req, res) {
        //set the new event id in the session
        req.session.passport.user.currentEventId = req.body.currentEventId;
        req.session.save();
        res.send(200);
    }
}

/**
 * Export singleton
 * @type {EventsController}
 */
module.exports = new EventsController();
