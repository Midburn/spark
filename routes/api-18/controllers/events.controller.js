const logger = require('../../../libs/logger')(module),
    Event = require('../../../models/event').Event,
    constants = require('../../../models/constants'),
    Ticket = require('../../../models/ticket').Ticket,
    bcrypt = require('bcrypt-nodejs'),
    _ = require('lodash'),
    eventsService = require('../services').eventsService;
const passportLib = require('../../../libs/passport');

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
        this.resetEvent = this.resetEvent.bind(this);
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

    changeSessionEventId(req, res) {
        //set the new event id in the session
        const newEventId = req.body.currentEventId
        const cookieOptions = process.env.NODE_ENV === 'production' ? { httpOnly: true,
                                                                        domain: constants.MIDBURN_DOMAIN,
                                                                        overwrite: true } : { httpOnly: true,
                                                                                              overwrite: true }
        req.session.passport.user.currentEventId = newEventId;
        req.session.save();
        res.cookie('authToken', passportLib.generateJwtToken(req.body.email, newEventId), cookieOptions);
        res.send(200);
    }

    resetEvent(req, res, next) {
        if (!req.body.password || !bcrypt.compareSync(req.body.password, req.user.attributes.password)) {
            return next(new Error('Wrong password!'));
        }
        const update = {
          inside_event: false
        };
        Ticket.where({ event_id: req.user.currentEventId })
            .fetchAll()
            .then(data => {
                return Promise.all(data.models.map(ticket => ticket.save(update)));
            })
            .then(res.send(200))
            .catch((err) => {
                /**
                 * Pass the error to be handled by the generic error handler
                 */
                return next(err);
            });
    }
}

/**
 * Export singleton
 * @type {EventsController}
 */
module.exports = new EventsController();
