const constants = require('../../models/constants'),
    knex = require('../../libs/db').knex,
    User = require('../../models/user').User,
    Camp = require('../../models/camp').Camp,
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
        Camp.forge({id: camp_id , event_id: current_event_id}).fetch().then((camp) => {
            let camp_mgr_id;
            if (camp_mgr instanceof User) {
                camp_mgr_id = camp_mgr.id;
                // isAdmin = camp.__parsePrototype(prototype,camp_mgr);
            } else {
                camp_mgr_id = parseInt(camp_mgr);
            }
            group_options = camp.parsePrototype(camp_mgr);
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
                                start : new Date(eventInfo.appreciation_tickets_allocation_start),
                                end : new Date(eventInfo.appreciation_tickets_allocation_end)
                            };

                            let jsonInfo;
                            try {
                                //pass the response to the process method
                                jsonInfo = Modify_User_AddInfo(resp[0].addinfo_json,addinfo_jason_subAction,camp,users,user,isAdmin,allocationDates);
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
}

/**
 * Export singleton;
 * @type {CampsService}
 */
module.exports = new CampsService();
