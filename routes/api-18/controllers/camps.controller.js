const campsService = require('../services/').campsService,
    helperService = require('../services/').helperService,
    usersService = require('../services/').usersService,
    common = require('../../../libs/common').common,
    constants = require('../../../models/constants'),
    csv = require('json2csv'),
    config = require('config'),
    LOG = require('../../../libs/logger')(module),
    S3 = require('../../../libs/aws-s3'),
    awsConfig = config.get('aws_config'),
    CampFile = require('../../../models/camp').CampFile,
    Camp = require('../../../models/camp').Camp,
    Event = require('../../../models/event').Event,
    User = require('../../../models/user').User;

class CampsController {

    constructor() {
        /**
         * Keep `this` reference for all methods
         */
        this.createCamp = this.createCamp.bind(this);
        this.editCamp = this.editCamp.bind(this);
        this.approveUserRequest = this.approveUserRequest.bind(this);
        this.documentCampFiles = this.documentCampFiles.bind(this);
        this.getCampFiles = this.getCampFiles.bind(this);
        this.deleteCampFile = this.deleteCampFile.bind(this);
        this.isCampNameAvailable = this.isCampNameAvailable.bind(this);
        this.getCamps = this.getCamps.bind(this);
        this.getCampsCSV = this.getCampsCSV.bind(this);
        this.getOpenCamps = this.getOpenCamps.bind(this);
        this.joinCampRequest = this.joinCampRequest.bind(this);
        this.countCampMembers = this.countCampMembers.bind(this);
        this.getAllCampMembers = this.getAllCampMembers.bind(this);
        this.addUserAsMember = this.addUserAsMember.bind(this);
        this.getCampManager = this.getCampManager.bind(this);
        this.deleteCamp = this.deleteCamp.bind(this);
        this.updateCampPreSaleQuota = this.updateCampPreSaleQuota.bind(this);
        this.updateEarlyArrivalQuota = this.updateEarlyArrivalQuota.bind(this);
        this.getPublishedCamps = this.getPublishedCamps.bind(this);
    }

    createCamp(req, res, next) {
        Camp.forge(campsService.createCampObject(req, true))
            .save()
            .then((camp) => {
                campsService.updateCampStatus(req.user.currentEventId,
                    camp.attributes.id,
                    camp.attributes.main_contact,
                    'approve_new_mgr',
                    req.user,
                    res);
        }).catch((err) => {
            /**
             * Pass the error to be handled by the generic error handler
             */
            next(err);
        });
    };

    editCamp(req, res, next) {
        // TODO - modifiy to use async await for readabllity
        Camp
            .forge({id: req.params.id, event_id: req.user.currentEventId})
            .fetch({withRelated: ['users_groups']})
            .then((camp) => {
                camp.getCampUsers((users) => {
                    let group_props = camp.parsePrototype(req.user);
                    if (camp.isCampManager(req.user.attributes.user_id) || group_props.isAdmin) {
                        campsService.saveCamp(req, false, camp)
                        // Camp.forge({ id: req.params.id }).fetch().then((camp) => {
                        // camp.save(__camps_create_camp_obj(req, false, camp))
                            .then(() => {
                                res.json({error: false, status: 'Camp updated'});
                                // });
                            }).catch((err) => {
                                /**
                                 * Pass the error to be handled by the generic error handler
                                 */
                                next(err);
                        });
                    } else {
                        helperService.customError(401, 'Cannot update camp', res, true);
                    }
                });
            })
            .catch((err) => {
                /**
                 * Pass the error to be handled by the generic error handler
                 */
                next(err);
            });
    }

    updateCampPublishingStatus(toPublish) {
        return (req, res, next) => {
            // TODO - modifiy to use async await for readabllity
            // If camp met all its requirements, can publish
            Camp.forge({ id: req.params.id })
                .fetch()
                .then((camp) => {
                    camp.save({ web_published: toPublish ? '1' : '0' })
                        .then(() => {
                            res.json({ error: false, status: toPublish ? 'Publish' : 'Unpublish' });
                        }).catch((err) => {
                        /**
                         * Pass the error to be handled by the generic error handler
                         */
                        next(err);
                    });
                }).catch((err) => {
                /**
                 * Pass the error to be handled by the generic error handler
                 */
                next(err);
            });
        }
    }

    approveUserRequest(req, res) {
        const user_id = req.params.user_id;
        const camp_id = req.params.camp_id;
        const action = req.params.action;
        const actions = ['approve', 'remove', 'revive', 'reject', 'approve_mgr', 'remove_mgr', 'pre_sale_ticket', 'group_sale_ticket', 'early_arrival'];
        if (actions.indexOf(action) > -1) {
            campsService.updateCampStatus(req.user.currentEventId, camp_id, user_id, action, req.user, res);
        } else {
            return helperService.customError(404, `illegal command (${action})`, res, true);
        }
    }

    async documentCampFiles(req, res, next) {
        const camp_id = req.params.camp_id;
        // Check if the user is allowed to upload the file
        if (!campsService.canEditCampFile(req.user)) {
            return helperService.customError(403, 'unauthorized file upload', res, true);
        }
        let camp = await Camp.forge({id: camp_id}).fetch({withRelated: ['files']});
        if (!camp) {
            /**
             * Pass the error to be handled by the generic error handler
             */
            return next(new Error('Camp Id does not exist'));
        }
        let data;
        try {
            data = req.files.file.data;
        } catch (err) {
            return helperService.customError(400, 'unauthorized file upload', res, true);
        }
        let fileName = `${camp.attributes.camp_name_en}/${req.files.file.name}`;
        const s3Client = new S3();
        // Upload the file to S3
        try {
            await s3Client.uploadFileBuffer(fileName, data, awsConfig.buckets.camp_file_upload)
        } catch (err) {
            LOG.error(err.message);
            /**
             * Pass the error to be handled by the generic error handler
             */
            return next(new Error('S3 Error: could not put file in S3'));
        }
        // Add the file to the camp_files table
        try {
            await new CampFile({
                created_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
                updated_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
                camp_id: camp.attributes.id,
                uploader_id: req.user.id,
                file_path: fileName,
            }).save()
        } catch (err) {
            LOG.error(err.message);
            return next(new Error('DB Error: could not connect or fetch data'));
        }
        camp = await Camp.forge({id: camp_id}).fetch({withRelated: ['files']});
        let campFiles = campsService.prepareCampFiles(camp, req.user);
        return res.status(200).json({
            error: false,
            files: campFiles
        })
    }

    async getCampFiles(req, res, next) {
        const camp_id = req.params.camp_id;
        let camp = await Camp.forge({id: camp_id}).fetch({withRelated: ['files']});
        if (!camp) {
            /**
             * Pass the error to be handled by the generic error handler
             */
            return next(new Error('Camp Id does not exist'));
        }
        let campFiles = campsService.prepareCampFiles(camp, req.user);
        return res.status(200).json({
            error: false,
            files: campFiles
        })
    }

    async deleteCampFile(req, res, next) {
        const camp_id = req.params.camp_id,
            doc_id = req.params.doc_id,
            s3Client = new S3();
        if (!campsService.canEditCampFile(req.user)) {
            return helperService.customError(403, 'unauthorized file deletion', res, true);
        }
        let camp = await Camp.forge({id: camp_id}).fetch({withRelated: ['files']});
        if (!camp) {
            /**
             * Pass the error to be handled by the generic error handler
             */
            return next(new Error('Camp Id does not exist'));
        }
        let existingFile = camp.relations.files.models.find((file) => {
            if (file.attributes.file_id === parseInt(doc_id)) {
                return file
            }
        });
        try {
            await s3Client.deleteObject(existingFile.attributes.file_path, awsConfig.buckets.camp_file_upload);
            await existingFile.destroy()
        } catch (err) {
            /**
             * Pass the error to be handled by the generic error handler
             */
            return next(new Error("Error deleting file " + err));
        }
        camp = await Camp.forge({id: camp_id}).fetch({withRelated: ['files']});
        let campFiles = campsService.prepareCampFiles(camp, req.user);
        return res.status(200).json({
            error: false,
            files: campFiles
        })
    }

    isCampNameAvailable(req, res, next) {
        const req_camp_name_en = req.params.camp_name_en;
        Camp.forge({camp_name_en: req_camp_name_en}).fetch().then((camp) => {
            if (camp === null) {
                // camp name is available
                res.status(204).end();
            } else {
                res.status(200).end();
            }
        }).catch((err) => {
            return next(err)
        });
    }

    getCamps(req, res, next) {
        Camp.where('status', '=', 'open', 'AND', 'event_id', '=', req.user.currentEventId, 'AND', '__prototype', '=', constants.prototype_camps.THEME_CAMP.id).fetchAll().then((camp) => {
            if (camp !== null) {
                return res.status(200).json({camps: camp.toJSON()})
            } else {
                return helperService.customError(404, 'Not found', res);
            }
        }).catch((err) => {
            return next(err);
        });
    }

    getCampsCSV(req, res) {
        const csv_fields = ['email'];
        const actionType = req.params.ActionType;
        if (actionType === "theme_camps") {
            campsService.retrieveDataFor(constants.prototype_camps.THEME_CAMP.id).then(result => {
                let csvRes = csv({data: result.data});
                res.setHeader('Content-Disposition', 'attachment; filename=camps.csv');
                res.set('Content-Type', 'text/csv');
                res.status(200).send(csvRes)
            })
        }
        else {
            usersService.retrieveDataForPresale().then(result => {
                let csv_file;
                try {
                    csv_file = csv({data: result, fields: csv_fields})
                } catch (err) {
                    // Errors are thrown for bad options, or if the data is empty and no fields are provided.
                    // Be sure to provide fields if it is possible that your data array will be empty.
                    console.error(err);
                }
                res.setHeader('Content-Disposition', 'attachment; filename=presaletickets.csv');
                res.set('Content-Type', 'text/csv');
                res.send(csv_file);
                res.status(200);
            })
        }
    }

    getOpenCamps(req, res, next) {
        let allowed_status = ['open', 'closed'];
        let web_published = [true, false];
        Camp.query((query) => {
            query
                .where('event_id', '=', req.user.currentEventId, 'AND', '__prototype', '=', constants.prototype_camps.THEME_CAMP.id)
                .whereIn('status', allowed_status)
                .whereIn('web_published', web_published);
        })
            .fetchAll().then((camp) => {
            if (camp !== null) {
                res.status(200).json({camps: camp.toJSON()})
            } else {
                return helperService.customError(404, 'Not found', res);
            }
        }).catch((err) => {
            return next(err);
        });
    }

    joinCampRequest(req, res, next) {
        const user = {
            id: req.user.attributes.user_id,
            full_name: [req.user.attributes.first_name, req.user.attributes.last_name].join(', '), //TODO: use user.fullName instead
            email: req.user.attributes.email
        };
        // User is camp free and doesn't have pending join request
        // User details will be sent to camp manager for approval
        req.user.getUserCamps((camps) => {
            if (req.user.isCampFree) {
                // Fetch camp manager email address
                Camp.forge({
                    id: req.params.id,
                    event_id: req.user.currentEventId,
                    __prototype: constants.prototype_camps.THEME_CAMP.id
                }).fetch({}).then((camp) => {
                    camp.getCampUsers((users) => {
                        if (camp.managers.length > 0) {
                            user.camp_id = camp.attributes.id;
                            return res.status(200).json({
                                data: {
                                    user: user,
                                    camp: {
                                        id: camp.attributes.id,
                                        manager_id: camp.attributes.managers[0].user_id,
                                        manager_email: camp.attributes.managers[0].email
                                    }
                                }
                            });
                        } else {
                            return helperService.customError(404, 'Couldn\'t find camp manager', res);

                        }
                    });
                }).catch((err) => {
                    return next(err);
                });
            } else {
                // User cannot join another camp
                return helperService.customError(404, 'User can only join one camp!', res);
            }
        });
    }

    handleCampJoinProcess(type) {
        return (req, res) => {
            const user_id = req.user.attributes.user_id;
            const camp_id = req.params.id;
            campsService.updateCampStatus(req.user.currentEventId, camp_id, user_id, type, user_id, res);
        }
    }

    countCampMembers(req, res) {
        Camp.forge({id: req.params.id}).fetch({withRelated: ['members']}).then((camp) => {
            res.status(200).json({members: camp.related('members').toJSON()})
        })
    }

    getAllCampMembers(req, res, next) {
        Camp.forge({id: req.params.id, event_id: req.user.currentEventId}).fetch().then((camp) => {
            camp.getCampUsers((members) => {
                const isCampManager = camp.isCampManager(req.user.id, req.t);
                if (!req.user.isAdmin) {
                    members = members.map(function (member) {
                        if (constants.CAMP_MEMBER_APPROVAL_ENUM.indexOf(member.member_status) < 0) {
                            member.cell_phone = '';
                            member.name = '';
                        }
                        delete member.first_name;
                        delete member.last_name;
                        delete member.gender;
                        delete member.date_of_birth;
                        delete member.israeli_id;
                        delete member.address;
                        delete member.extra_phone;
                        delete member.facebook_id;
                        delete member.facebook_token;
                        delete member.addinfo_json;
                        return member;
                    });
                }
                //check eahc memebr and send to the client the jason info
                for (const i in members) {
                    if (members[i].camps_members_addinfo_json) {
                        const addinfo_json = JSON.parse(members[i].camps_members_addinfo_json);
                        //check for pre sale ticket info and update the memebr
                        if (addinfo_json.pre_sale_ticket === "true") {
                            members[i].pre_sale_ticket = true;
                        }
                        if (addinfo_json.group_sale_ticket === "true") {
                            members[i].group_sale_ticket = true;
                        }
                        members[i].early_arrival = addinfo_json.early_arrival
                    } else {
                        members[i].pre_sale_ticket = false;
                        members[i].group_sale_ticket = false;
                    }
                }
                const result = camp.parsePrototype(req.user);
                if (isCampManager || (result && result.isAdmin)) {
                    res.status(200).json({
                        members: members,
                        pre_sale_tickets_quota: camp.attributes.pre_sale_tickets_quota
                    });
                } else {
                    // TODO - should return 403 forbidden
                    return next(new Error('Permission denied'));
                }
            }, req)
        }).catch((er) => {
            return next(err);
        });
    }

    addUserAsMember(req, res, next) {
        const user_email = req.body.user_email;
        const camp_id = req.params.id;
        if (!common.validateEmail(user_email)) {
            res.status(500).json({error: true, data: {message: 'Bad email entered!'}});
            return;
        }
        Camp.forge({id: camp_id}).fetch().then((camp) => {
            if (!camp) {
                res.status(404).end();
                return;
            }
            req.user.getUserCamps((camps) => {
                // let group_props = camp.parsePrototype(req.user);
                let group_props = camp.parsePrototype(req.user);
                if (req.user.isManagerOfCamp(camp_id) || group_props.isAdmin) {
                    User.forge({email: user_email}).fetch().then((user) => {
                        if (user !== null) {
                            //this user is not the one is logged in, so the current event Id does not exixts
                            //we need to add it from the logged user so getUserCamps will know what to search for
                            user.currentEventId = req.user.currentEventId;
                            // check that user is only at one camp!
                            user.getUserCamps((camps) => {
                                if (camps.length === 0 || !user.attributes.camp || group_props.multiple_groups_for_user) {
                                    campsService.updateCampStatus(req.user.currentEventId, camp_id, user.attributes.user_id, 'request_mgr', req.user, res);
                                } else {
                                    let message;
                                    if (user.isUserInCamp(camp_id)) {
                                        message = 'Already applied to this camp';
                                    } else {
                                        message = 'Already applied to different camp!';
                                    }
                                    return next(new Error(message));
                                }
                            }, null, camp.attributes.__prototype);
                        } else {
                            return next(new Error('Cannot add new emails without profile.'));
                        }
                    });

                } else {
                    res.status(404).end();
                }
            }, req, camp.attributes.__prototype);
        });
    }

    getCampManager(req, res, next) {
        User.forge({camp_id: req.params.id})
            .fetch({
                require: true,
                columns: ['email', 'roles']
            })
            .then((user) => {
                if (user.get('roles').indexOf('camp_manager')) {
                    res.status(200).json({user: {email: user.get('email')}})
                } else {
                    helperService.customError(404, 'Not found', res, true);
                }
            }).catch((err) => {
             return next(err);
        });
    }

    deleteCamp(req, res, next) {
        Camp.forge({id: req.params.id})
            .fetch().then((camp) => {
            camp.save({status: 'inactive'}).then(() => {
                res.status(200).end()
            }).catch((err) => {
                return next(err);
            });
        });
    }

    updateCampPreSaleQuota(req, res) {
        //should we implement dates controll here as well (as long as it is admin only)???
        Camp.forge({id: req.params.id})
            .fetch().then((camp) => {
            const quota = req.body.quota;
            if (common.isNormalInteger(quota) === false) {
                return res.status(500).json({
                    error: true,
                    data: {
                        message: "Quota must be in a number format"
                    }
                });
            }
            const campUpdate = req.body.isGroupSale ? { group_sale_tickets_quota: quota } : { pre_sale_tickets_quota: quota };
            camp.save(campUpdate).then(() => {
                return res.sendStatus(200);
            }).catch((err) => {
                return next(err);
            });
        });
    }

    updateEarlyArrivalQuota(req, res) {
        Camp.forge({id: req.params.id})
            .fetch({withRelated: ['users_groups']})
            .then((camp) => {
                const quota = req.body.quota;
                if (common.isNormalInteger(quota) === false) {
                    return res.status(500).json({
                        error: true,
                        data: {
                            message: "Quota must be in a number format"
                        }
                    });
                }
                let group_props = camp.parsePrototype(req.user);
                if (group_props.isAdmin) {
                    if (quota !== 'undefined' && quota !== '') {
                        return camp.relations.users_groups.save({entrance_quota: parseInt(quota)});
                    } else return camp;
                }
            });
    }

    getPublishedCamps(req, res, next) {
        res.header('Access-Control-Allow-Origin', 'https://midburn-camps.firebaseapp.com');
        res.header('Access-Control-Allow-Methods', 'GET');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        let allowed_status = ['open', 'closed'];
        let web_published = [true];
        Camp.query((query) => {
            query
                .select([
                    "camp_name_he",
                    "camp_name_en",
                    "camp_desc_he",
                    "camp_desc_en",
                    "status",
                    "contact_person_name",
                    "contact_person_phone",
                    "contact_person_email",
                    "facebook_page_url",
                    "accept_families",
                    "support_art"
                ])
                .where('event_id', '=', Event.CurrentEventId, 'AND', '__prototype', '=', constants.prototype_camps.THEME_CAMP.id)
                .whereIn('status', allowed_status)
                .whereIn('web_published', web_published);
        }).fetchAll().then((camps) => {
            res.status(200).json({
                quantity: camps.length,
                camps: camps.toJSON()
            })
        }).catch((err) => {
            return next(err);
        });
    }
}

/**
 * Export singleton
 * @type {CampsController}
 */
module.exports = new CampsController();
