const common = require('../libs/common').common;
const _ = require('lodash');
const Event = require('../models/event').Event;
const User = require('../models/user').User;
// const Camp = require('../models/camp').Camp;
const constants = require('../models/constants.js');
const knex = require('../libs/db').knex;
const userRole = require('../libs/user_role');
const config = require('config')

module.exports = (app, passport) => {
    /**
     * API: (GET) get user by id
     * request => /users/:id
     */
    app.get('/events/:event_id',
        [userRole.isLoggedIn()],
        (req, res) => {
            var event_id = req.params.event_id;
            Event.forge({ event_id: event_id }).fetch().then((event) => {
                let props = {};
                if (typeof event.attributes.json_data === 'string') {
                    props = JSON.parse(event.attributes.json_data);
                }
                for (var prop in props) { events.attributes[prop] = props[prop]; }
                console.log(event);
                res.json({ event: event });
            });

            //         User.forge({ user_id: req.params.id }).fetch({ columns: '*' }).then((user) => {
            //             if (user !== null) {
            //                 res.json({ name: user.get('name'), email: user.get('email'), cell_phone: user.get('cell_phone') })
            //             } else {
            //                 res.status(404).json({ message: 'Not found' })
            //             }

            //         }).catch((err) => {
            //             res.status(500).json({
            //                 error: true,
            //                 data: {
            //                     message: err.message
            //                 }
            //             });
            //         });
            //     });
            // /**
            //  * API: (GET) get event by id
            //  * request => /users/:email
            //  */
            // app.get('/events/:id',
            //     [userRole.isLoggedIn()],
            //     (req, res) => {
            //         User.forge({ email: req.params.email }).fetch().then((user) => {
            //             if (user !== null) {
            //                 res.status(200).end()
            //             } else {
            //                 res.status(404).end()
            //             }
            //         }).catch((err) => {
            //             res.status(500).json({
            //                 error: true,
            //                 data: {
            //                     message: err.message
            //                 }
            //             });
            //         });
        });

    const __camps_save = function (req, isNew, camp) {
        // // __prototype: constants.prototype_camps.THEME_CAMP.id,
        // if (camp instanceof Camp) {
        //     prototype = camp.attributes.__prototype;
        // } else if (typeof (camp) === 'string' && camp !== '') {
        //     prototype = camp;
        // } else prototype = constants.prototype_camps.THEME_CAMP.id;
        // group_props = Camp.prototype.__parsePrototype(prototype, req.user);
        // var data = {
        //     event_id: constants.CURRENT_EVENT_ID,
        //     // for update or insert, need to merge with create to be the same call
        //     updated_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
        //     desc_he: req.body.desc_he,
        //     desc_en: req.body.desc_en,
        //     // status: req.body.camp_status,
        //     // type: req.body.type,
        //     // facebook_page_url: req.body.facebook_page_url,
        //     // contact_person_name: req.body.contact_person_name,
        //     // contact_person_email: req.body.contact_person_email,
        //     // contact_person_phone: req.body.contact_person_phone,
        //     // accept_families: req.body.accept_families,
        //     // camp_activity_time: req.body.camp_activity_time,
        //     // child_friendly: req.body.child_friendly,
        //     // noise_level: req.body.noise_level,
        //     support_art: req.body.support_art,
        // }
        // var __update_prop_foreign = function (propName) {
        //     if (parseInt(req.body[propName]) > 0) {
        //         data[propName] = req.body[propName];
        //     }
        // }
        // var __update_prop = function (propName, options) {
        //     if (req.body[propName] !== undefined) {
        //         let value = req.body[propName];
        //         if (!options || (options instanceof Array && options.indexOf(value) > -1)) {
        //             data[propName] = value;
        //         }
        //         return value;
        //     }
        // }
        // if (isNew) {
        //     data.created_at = (new Date()).toISOString().substring(0, 19).replace('T', ' ');
        //     data.__prototype = prototype;
        // }
        // if (isNew || group_props.isAdmin) {
        //     __update_prop('camp_name_en');
        //     __update_prop('camp_name_he');
        // }

        // if (group_props.isAdmin) {
        //     // var campAddInfoJson = { early_arrival_quota: '' };
        //     // if (req.body.camp_early_arrival_quota) {
        //     //     if (curCamp) {
        //     //         campAddInfoJson = JSON.parse(curCamp.attributes.addinfo_json);
        //     //         if (campAddInfoJson === '' || campAddInfoJson === null) {
        //     //             campAddInfoJson = { early_arrival_quota: '' };
        //     //         }
        //     //     }
        //     //     campAddInfoJson.early_arrival_quota = req.body.camp_early_arrival_quota;
        //     // }
        //     // data.addinfo_json = JSON.stringify(campAddInfoJson);
        // }
        // __update_prop('noise_level', constants.CAMP_NOISE_LEVELS);
        // // if (req.body.camp_status)
        // __update_prop_foreign('main_contact_person_id');
        // __update_prop_foreign('main_contact');
        // __update_prop_foreign('moop_contact');
        // __update_prop_foreign('safety_contact');

        // let camp_statuses = ['open', 'closed'];
        // if (group_props.isAdmin) {
        //     camp_statuses = constants.CAMP_STATUSES; // to include inactive
        //     __update_prop('public_activity_area_sqm');
        //     __update_prop('public_activity_area_desc');
        //     __update_prop('location_comments');
        //     __update_prop('camp_location_street');
        //     __update_prop('camp_location_street_time');
        //     __update_prop('camp_location_area');
        // }
        // if (camp_statuses.indexOf(req.body.camp_status) > -1) {
        //     data.status = req.body.camp_status;
        // }
        // // saving the data!
        // return Camp.forge({ id: req.params.id })
        //     .fetch({ withRelated: ['users_groups'] })
        //     .then((camp) => {
        //         return camp.save(data).then(camp => {
        //             if (group_props.isAdmin) {
        //                 if (req.body.entrance_quota !== 'undefined' && req.body.entrance_quota !== '') {
        //                     return camp.relations.users_groups.save({ entrance_quota: parseInt(req.body.entrance_quota) });
        //                 } else return camp;
        //             }
        //         });

        //     })
    }

    var __camps_create_camp_obj = function (req, isNew, curCamp) {
        // var data = {
        //     __prototype: constants.prototype_camps.THEME_CAMP.id,
        //     event_id: constants.CURRENT_EVENT_ID,
        //     // for update or insert, need to merge with create to be the same call
        //     updated_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
        //     camp_desc_he: req.body.camp_desc_he,
        //     camp_desc_en: req.body.camp_desc_en,
        //     // status: req.body.camp_status,
        //     type: req.body.type,
        //     facebook_page_url: req.body.facebook_page_url,
        //     contact_person_name: req.body.contact_person_name,
        //     contact_person_email: req.body.contact_person_email,
        //     contact_person_phone: req.body.contact_person_phone,
        //     accept_families: req.body.accept_families,
        //     camp_activity_time: req.body.camp_activity_time,
        //     child_friendly: req.body.child_friendly,
        //     // noise_level: req.body.noise_level,
        //     support_art: req.body.support_art,
        // }
        // var __update_prop_foreign = function (propName) {
        //     if (parseInt(req.body[propName]) > 0) {
        //         data[propName] = req.body[propName];
        //     }
        // }
        // var __update_prop = function (propName, options) {
        //     if (req.body[propName] !== undefined) {
        //         let value = req.body[propName];
        //         if (!options || (options instanceof Array && options.indexOf(value) > -1)) {
        //             data[propName] = value;
        //         }
        //         return value;
        //     }
        // }
        // if (isNew) {
        //     data.created_at = (new Date()).toISOString().substring(0, 19).replace('T', ' ');
        // }
        // if (isNew || req.user.isAdmin) {
        //     __update_prop('camp_name_en');
        //     __update_prop('camp_name_he');
        // }

        // if (req.user.isAdmin) {
        //     var campAddInfoJson = { early_arrival_quota: '' };
        //     if (req.body.camp_early_arrival_quota) {
        //         if (curCamp) {
        //             campAddInfoJson = JSON.parse(curCamp.attributes.addinfo_json);
        //             if (campAddInfoJson === '' || campAddInfoJson === null) {
        //                 campAddInfoJson = { early_arrival_quota: '' };
        //             }
        //         }
        //         campAddInfoJson.early_arrival_quota = req.body.camp_early_arrival_quota;
        //     }
        //     data.addinfo_json = JSON.stringify(campAddInfoJson);
        // }
        // __update_prop('noise_level', constants.CAMP_NOISE_LEVELS);
        // // if (req.body.camp_status)
        // __update_prop_foreign('main_contact_person_id');
        // __update_prop_foreign('main_contact');
        // __update_prop_foreign('moop_contact');
        // __update_prop_foreign('safety_contact');

        // let camp_statuses = ['open', 'closed'];
        // if (req.user.isAdmin) {
        //     camp_statuses = constants.CAMP_STATUSES;
        //     __update_prop('public_activity_area_sqm');
        //     __update_prop('public_activity_area_desc');
        //     __update_prop('location_comments');
        //     __update_prop('camp_location_street');
        //     __update_prop('camp_location_street_time');
        //     __update_prop('camp_location_area');
        // }
        // if (camp_statuses.indexOf(req.body.camp_status) > -1) {
        //     data.status = req.body.camp_status;
        // }
        // return data;
    }
    /**
      * API: (POST) create camp
      * request => /camps/new
      */
    app.post('/events/new',
        [userRole.isLoggedIn(), userRole.isAllowNewCamp()],
        (req, res) => {
            // Camp.forge(__camps_create_camp_obj(req, true)).save().then((camp) => {
            //     __camps_update_status(camp.attributes.id, camp.attributes.main_contact, 'approve_new_mgr', req.user, res);
            // }).catch((e) => {
            //     res.status(500).json({
            //         error: true,
            //         data: {
            //             message: e.message
            //         }
            //     });
            // });
        });
    /**
       * API: (PUT) save camp data
       * request => /camps/1/edit
       */
    app.get('/events/:event/edit', userRole.isLoggedIn(), (req, res) => {

        // console.log('here');
        // Event.forge({ event_id: req.params.event }).then((event) => {
        // console.log(event);
        // });

        // Camp
        //     .forge({ id: req.params.id })
        //     .fetch({ withRelated: ['users_groups'] })
        //     .then((camp) => {
        //         camp.getCampUsers((users) => {
        //             group_props = camp.parsePrototype(req.user);
        //             if (camp.isCampManager(req.user.attributes.user_id) || group_props.isAdmin) {
        //                 __camps_save(req, false, camp)
        //                     // Camp.forge({ id: req.params.id }).fetch().then((camp) => {
        //                     // camp.save(__camps_create_camp_obj(req, false, camp))
        //                     .then(() => {
        //                         res.json({ error: false, status: 'Camp updated' });
        //                         // });
        //                     }).catch((err) => {
        //                         res.status(500).json({
        //                             error: true,
        //                             data: {
        //                                 message: err.message
        //                             }
        //                         });
        //                     });
        //                 // });
        //             } else {
        //                 res.status(401).json({ error: true, status: 'Cannot update camp' });
        //             }
        //         });
        //     }).catch((err) => {
        //         res.status(500).json({
        //             error: true,
        //             data: {
        //                 message: err.message
        //             }
        //         });
        //     });
    });

}