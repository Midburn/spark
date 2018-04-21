const constants = require('../../../models/constants'),
    _ = require('lodash'),
    knex = require('../../../libs/db').knex,
    User = require('../../../models/user').User,
    Camp = require('../../../models/camp').Camp,
    // config = require('config'),
    // camp_files_config = config.get('camp_files_config'),
    usersService = require('./users.service'),
    S3 = require('../../../libs/aws-s3'),
    helperService = require('./helper.service');

class CampsService {
    /**
     * Formely know as __camps_update_status
     * @param current_event_id
     * @param camp_id
     * @param user_id
     * @param action
     * @param camp_mgr
     * @param res
     */
    updateCampStatus(current_event_id, camp_id, user_id, action, camp_mgr, res) {
        let isGroupSale;
        if (action === 'group_sale_ticket') {
            action = 'pre_sale_ticket';
                isGroupSale = true;
        }
        Camp.forge({id: camp_id , event_id: current_event_id}).fetch().then((camp) => {
            let camp_mgr_id;
            if (camp_mgr instanceof User) {
                camp_mgr_id = camp_mgr.id;
                // isAdmin = camp.__parsePrototype(prototype,camp_mgr);
            } else {
                camp_mgr_id = parseInt(camp_mgr);
            }
            const group_options = camp.parsePrototype(camp_mgr);
            let isAdmin = group_options.isAdmin;
            console.log(action + " from camp " + camp_id + " of user " + user_id + " / mgr id: " + camp_mgr_id);
            let addinfo_jason_subAction = null;
            camp.getCampUsers((users) => {
                let new_status;
                const save_method = { require: true };
                const mail_delivery = {
                    template: '',
                    subject: '',
                    to_mail: '',
                };
                const user = camp.isUserInCamp(user_id, true);
                const camp_manager = camp.isCampManager(camp.attributes.main_contact);
                // camp manager commands
                if (action === 'approve_new_mgr' && (camp_mgr_id === camp.attributes.main_contact || isAdmin)) {
                    new_status = 'approved';
                    if (!user) {
                        save_method.require = false;
                        save_method.method = 'insert';
                    }
                } else if (camp.isCampManager(camp_mgr_id) || isAdmin) {
                    if (user && action === "remove_mgr" && user.member_status === 'approved_mgr' && (camp_mgr_id === camp.attributes.main_contact || isAdmin)) {
                        new_status = 'approved';
                    } else if (user && action === "approve_mgr" && user.member_status === 'approved' && (camp_mgr_id === camp.attributes.main_contact || isAdmin)) {
                        new_status = 'approved_mgr';
                    } else if (user && action === "approve" && user.can_approve) {
                        mail_delivery.to_mail = user.email;
                        mail_delivery.subject = 'Spark: you have been approved!';
                        mail_delivery.template = 'emails/camps/member_approved';
                        new_status = 'approved';
                    } else if (user && action === "remove" && user.can_remove) {
                        new_status = 'deleted';
                    } else if (user && action === "reject" && user.can_reject) {
                        mail_delivery.to_mail = user.email;
                        mail_delivery.subject = 'Spark: you have been Rejected!';
                        mail_delivery.template = 'emails/camps/member_rejected';
                        new_status = 'rejected';
                    } else if (user && action === "revive") {
                        new_status = 'pending';
                    } else if (user && action === "pre_sale_ticket") {
                        addinfo_jason_subAction ="pre_sale_ticket";
                    } else if (user && action === "early_arrival") {
                        addinfo_jason_subAction ="early_arrival";
                    } else if (action === "request_mgr") {
                        if (group_options.auto_approve_new_members) {
                            new_status = 'approved';
                        } else {
                            new_status = 'pending_mgr';
                            mail_delivery.to_mail = '';
                            mail_delivery.subject = 'Spark: you have been requested to join camp';
                            mail_delivery.template = 'emails/camps/member_request';
                        }
                        if (!user) {
                            save_method.require = false;
                            save_method.method = 'insert';
                        } else if (user.member_status === 'approved') {
                            new_status = null;
                        }
                    }
                } else {
                    if (action === 'join') {
                        new_status = 'pending';
                        if (camp_manager) {
                            mail_delivery.subject = 'Spark: Someone wants to join your camp!';
                            mail_delivery.template = 'emails/camps/join_request';
                            mail_delivery.to_mail = camp_manager.email;
                        }
                        if (!user) {
                            save_method.require = false;
                            save_method.method = 'insert';
                        } else if (user.member_status === 'approved') {
                            new_status = null;
                        }
                    } else if (action === 'join_mgr' && user && user.member_status === 'pending_mgr' && camp_mgr_id === user_id) {
                        new_status = 'approved';
                        if (camp_manager) {
                            mail_delivery.subject = 'Spark: A member approved himself to your camp!';
                            mail_delivery.template = 'emails/camps/member_approved';
                            mail_delivery.to_mail = camp_manager.email;
                        }
                    } else if (action === 'join_cancel' && user && user.member_status !== 'deleted' && camp_mgr_id === user_id) {
                        new_status = 'deleted';
                        if (camp_manager) {
                            mail_delivery.subject = 'Spark: ' + user.email + ' canceled himself from your camp!';
                            mail_delivery.template = 'emails/camps/join_cancel';
                            mail_delivery.to_mail = camp_manager.email;
                        }
                    }
                }

                const _after_update = () => {
                    const data = {
                        camp_id: camp.attributes.id,
                        user_id: user_id,
                    };
                    console.log(action + " from camp " + data.camp_id + " of user " + data.user_id + " / status: " + data.status);
                    if (group_options.send_mail && mail_delivery.template !== '') {
                        if (user) {
                            let email = mail_delivery.to_mail !== '' ? mail_delivery.to_mail : user.email;
                            helperService.emailDeliver(email, mail_delivery.subject, mail_delivery.template, { user: user, camp: camp.toJSON(), camp_manager: camp_manager }); // notify the user
                        } else {
                            User.forge({ user_id: user_id }).fetch().then((user) => {
                                let email = mail_delivery.to_mail !== '' ? mail_delivery.to_mail : user.attributes.email;
                                helperService.emailDeliver(email, mail_delivery.subject, mail_delivery.template, { user: user.toJSON(), camp: camp.toJSON(), camp_manager: camp_manager }); // notify the user
                            });
                        }
                    }
                    const res_data = { data: { member: data } };
                    if (action === 'approve_new_mgr') {
                        res_data.data.message = 'camp created';
                        res_data.data.camp_id = camp_id;
                    }
                    res.status(200).json(res_data);

                };

                //check if the request is to update the addinfo_json column
                if (addinfo_jason_subAction !== null) {
                    const userData = {
                        camp_id: camp.attributes.id,
                        user_id: user_id,

                    };

                    // select the addinfo_json column from the camp member table
                    knex(constants.CAMP_MEMBERS_TABLE_NAME)
                        .select('user_id', `${constants.CAMP_MEMBERS_TABLE_NAME}.addinfo_json`, `${constants.EVENTS_TABLE_NAME}.addinfo_json as eventInfo`)
                        .rightJoin(constants.EVENTS_TABLE_NAME,`${constants.EVENTS_TABLE_NAME}.event_id`,`${constants.EVENTS_TABLE_NAME}.event_id`)
                        .where({
                            event_id: current_event_id,
                            camp_id : userData.camp_id,
                            user_id : userData.user_id
                        })
                        .then(resp => {
                            // checking that update of the pre sale ticket allocation is inside the valid time period
                            const eventInfo = JSON.parse(resp[0].eventInfo);
                            const allocationDates = {
                                start : isGroupSale ? new Date(eventInfo.group_sale_tickets_allocation_start) : new Date(eventInfo.appreciation_tickets_allocation_start),
                                end : isGroupSale ? new Date(eventInfo.group_sale_tickets_allocation_end) : new Date(eventInfo.appreciation_tickets_allocation_end)
                            }

                            let jsonInfo;
                            try {
                                //pass the response to the process method
                                jsonInfo = usersService.modifyUsersInfo(resp[0].addinfo_json,addinfo_jason_subAction,camp,users,user,isAdmin,allocationDates, isGroupSale);
                            } catch (err) {
                                res.status(500);
                                throw new Error(res.json({error: true, data: { message: err.message }}));
                            }

                            //update the table with the new value of the json info
                            //on success go to _after_update callback
                            knex(constants.CAMP_MEMBERS_TABLE_NAME).update({addinfo_json : jsonInfo})
                                .where({
                                    camp_id : userData.camp_id,
                                    user_id : userData.user_id
                                })
                                .then(_after_update).catch((e) => {
                                console.log(e);
                            })
                        })
                        .catch((e) => {
                            console.log(e);
                        })
                }
                else if (new_status) {
                    const data = {
                        camp_id: camp.attributes.id,
                        user_id: user_id,
                        status: new_status
                    };
                    let query = '';
                    if (save_method.method === 'insert') {
                        query = knex(constants.CAMP_MEMBERS_TABLE_NAME).insert(data).toString();
                    } else {
                        query = 'UPDATE ' + constants.CAMP_MEMBERS_TABLE_NAME + ' SET status="' + data.status + '" WHERE camp_id=' + data.camp_id + ' AND user_id=' + data.user_id + ';';
                    }

                    knex.raw(query).then(_after_update);
                } else {
                    res.status(404).json({ error: true, data: { message: "Cannot execute this command." } });
                }
            });
        }).catch((e) => {
            res.status(500).json({
                error: true,
                data: {
                    message: e.message
                }
            })
        });
    }

    saveCamp(req, isNew, camp) {
        // TODO - remove req logic out of this function.
        // __prototype: constants.prototype_camps.THEME_CAMP.id,
        let prototype;
        if (camp instanceof Camp) {
            prototype = camp.attributes.__prototype;
        } else if (typeof (camp) === 'string' && camp !== '') {
            prototype = camp;
        } else prototype = constants.prototype_camps.THEME_CAMP.id;
        const group_props = Camp.prototype.__parsePrototype(prototype, req.user);
        const data = {
            event_id: req.user.currentEventId,
            // for update or insert, need to merge with create to be the same call
            updated_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
            camp_desc_he: req.body.camp_desc_he,
            camp_desc_en: req.body.camp_desc_en,
            // status: req.body.camp_status,
            type: req.body.type,
            facebook_page_url: req.body.facebook_page_url,
            contact_person_name: req.body.contact_person_name,
            contact_person_email: req.body.contact_person_email,
            contact_person_phone: req.body.contact_person_phone,
            accept_families: req.body.accept_families,
            camp_activity_time: req.body.camp_activity_time,
            child_friendly: req.body.child_friendly,
            // noise_level: req.body.noise_level,
            support_art: req.body.support_art,
        };

        if (isNew) {
            data.created_at = (new Date()).toISOString().substring(0, 19).replace('T', ' ');
            data.__prototype = prototype;
        }
        if (isNew || group_props.isAdmin) {
            helperService.updateProp(data, req.body, 'camp_name_en');
            helperService.updateProp(data, req.body, 'camp_name_he');
        }

        if (group_props.isAdmin) {
            // var campAddInfoJson = { early_arrival_quota: '' };
            // if (req.body.camp_early_arrival_quota) {
            //     if (curCamp) {
            //         campAddInfoJson = JSON.parse(curCamp.attributes.addinfo_json);
            //         if (campAddInfoJson === '' || campAddInfoJson === null) {
            //             campAddInfoJson = { early_arrival_quota: '' };
            //         }
            //     }
            //     campAddInfoJson.early_arrival_quota = req.body.camp_early_arrival_quota;
            // }
            // data.addinfo_json = JSON.stringify(campAddInfoJson);
        }
        helperService.updateProp(data, req.body, 'noise_level', constants.CAMP_NOISE_LEVELS);
        // if (req.body.camp_status)
        helperService.updateForeignProp(data, req.body, 'main_contact_person_id');
        helperService.updateForeignProp(data, req.body, 'main_contact');
        helperService.updateForeignProp(data, req.body, 'moop_contact');
        helperService.updateForeignProp(data, req.body, 'safety_contact');

        let camp_statuses = ['open', 'closed'];
        if (group_props.isAdmin) {
            camp_statuses = constants.CAMP_STATUSES; // to include inactive
            helperService.updateProp(data, req.body, 'public_activity_area_sqm');
            helperService.updateProp(data, req.body, 'public_activity_area_desc');
            helperService.updateProp(data, req.body, 'location_comments');
            helperService.updateProp(data, req.body, 'camp_location_street');
            helperService.updateProp(data, req.body, 'camp_location_street_time');
            helperService.updateProp(data, req.body, 'camp_location_area');
            helperService.updateProp(data, req.body, 'pre_sale_tickets_quota');
        }
        if (camp_statuses.indexOf(req.body.camp_status) > -1) {
            data.status = req.body.camp_status;
        }
        // saving the data!
        return Camp.forge({ id: req.params.id })
            .fetch({ withRelated: ['users_groups'] })
            .then((camp) => {
                return camp.save(data).then(camp => {
                    if (group_props.isAdmin) {
                        if (req.body.entrance_quota !== 'undefined' && req.body.entrance_quota !== '') {
                            return camp.relations.users_groups.save({ entrance_quota: parseInt(req.body.entrance_quota) });
                        } else return camp;
                    }
                });

            })
    }

    /**
     * Formely known as __camps_create_camp_obj
     * @param req
     * @param isNew
     * @param curCamp
     * @returns {{__prototype: string, event_id: *, updated_at: string, camp_desc_he: (*|string|string|string|null|string), camp_desc_en: (*|string|string|string|string|string), type, facebook_page_url: (*|string|null|CAMP_MOCK_SCHEMA.STRUCTURE.facebook_page_url|{faker}), contact_person_name: *, contact_person_email: (*|string|string|string|string|string), contact_person_phone: (*|CAMP_MOCK_SCHEMA.STRUCTURE.contact_person_phone|{function}), accept_families: (*|number|null|CAMP_MOCK_SCHEMA.STRUCTURE.accept_families|{faker}), camp_activity_time: (*|CAMP_MOCK_SCHEMA.STRUCTURE.camp_activity_time|{values}|string|string|string), child_friendly: (*|number|null|CAMP_MOCK_SCHEMA.STRUCTURE.child_friendly|{faker}), support_art: (*|CAMP_MOCK_SCHEMA.STRUCTURE.support_art|{faker}|number|null)}}
     */
    createCampObject(req, isNew, curCamp) {
        const data = {
            __prototype: constants.prototype_camps.THEME_CAMP.id,
            event_id: req.user.currentEventId,
            // for update or insert, need to merge with create to be the same call
            updated_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
            camp_desc_he: req.body.camp_desc_he,
            camp_desc_en: req.body.camp_desc_en,
            // status: req.body.camp_status,
            type: req.body.type,
            facebook_page_url: req.body.facebook_page_url,
            contact_person_name: req.body.contact_person_name,
            contact_person_email: req.body.contact_person_email,
            contact_person_phone: req.body.contact_person_phone,
            accept_families: req.body.accept_families,
            camp_activity_time: req.body.camp_activity_time,
            child_friendly: req.body.child_friendly,
            // noise_level: req.body.noise_level,
            support_art: req.body.support_art,
        };
        if (isNew) {
            data.created_at = (new Date()).toISOString().substring(0, 19).replace('T', ' ');
        }
        if (isNew || req.user.isAdmin) {
            helperService.updateProp(data, req.body, 'camp_name_en');
            helperService.updateProp(data, req.body, 'camp_name_he');
        }

        if (req.user.isAdmin) {
            let campAddInfoJson = { early_arrival_quota: '' };
            if (req.body.camp_early_arrival_quota) {
                if (curCamp) {
                    campAddInfoJson = JSON.parse(curCamp.attributes.addinfo_json);
                    if (campAddInfoJson === '' || campAddInfoJson === null) {
                        campAddInfoJson = { early_arrival_quota: '' };
                    }
                }
                campAddInfoJson.early_arrival_quota = req.body.camp_early_arrival_quota;
            }
            data.addinfo_json = JSON.stringify(campAddInfoJson);
        }
        helperService.updateProp(data, req.body, 'noise_level', constants.CAMP_NOISE_LEVELS);
        // if (req.body.camp_status)
        helperService.updateForeignProp(data, req.body, 'main_contact_person_id');
        helperService.updateForeignProp(data, req.body, 'main_contact');
        helperService.updateForeignProp(data, req.body, 'moop_contact');
        helperService.updateForeignProp(data, req.body, 'safety_contact');

        let camp_statuses = ['open', 'closed'];
        if (req.user.isAdmin) {
            camp_statuses = constants.CAMP_STATUSES;
            helperService.updateProp(data, req.body, 'public_activity_area_sqm');
            helperService.updateProp(data, req.body, 'public_activity_area_desc');
            helperService.updateProp(data, req.body, 'location_comments');
            helperService.updateProp(data, req.body, 'camp_location_street');
            helperService.updateProp(data, req.body, 'camp_location_street_time');
            helperService.updateProp(data, req.body, 'camp_location_area');
        }
        if (camp_statuses.indexOf(req.body.camp_status) > -1) {
            data.status = req.body.camp_status;
        }
        return data;
    }

    canEditCampFile(user) {
        // If the user is an Admin, he can edit files without constraints
        // if (user.isAdmin) return true;
        // const now = new Date();
        // const startDate = new Date(camp_files_config.upload_start_date);
        // const endDate = new Date(camp_files_config.upload_end_date);
        // return user.isCampManager && now > startDate && now < endDate;
        return true
    }

    prepareCampFiles(camp, user) {
        const s3Client = new S3();
        return camp.relations.files.models.map((file) => {
            return {
                file_id: file.attributes.file_id,
                display_name: file.attributes.file_path.split("/")[1],
                file_path: s3Client.getPresignedUrl(file.attributes.file_path, awsConfig.buckets.camp_file_upload),
                canEdit: this.canEditCampFile(user)
            }
        });
    }

    retrieveDataFor(group_proto, user) {
        return Camp.query((query) => {
            query
                .select('camps.*', 'users_groups.entrance_quota')
                .leftJoin('users_groups', 'camps.id', 'users_groups.group_id')
                .where({ 'camps.event_id': user.currentEventId , 'camps.__prototype': group_proto })
        })
            .orderBy('camp_name_en', 'ASC')
            .fetchAll()
            .then(camp => {
                if (!_.isUndefined(camp)) {
                    return {
                        status: 200,
                        data: {
                            camps: camp.toJSON()
                        }
                    };
                } else {
                    return {
                        status: 404,
                        data: { data: { message: 'Not found' } }
                    };
                }
            }).catch(err => {
                return {
                    status: 500,
                    data: {
                        error: true,
                        data: { message: err.message }
                    }
                };
            });
    }
}

/**
 * Export singleton;
 * @type {CampsService}
 */
module.exports = new CampsService();
