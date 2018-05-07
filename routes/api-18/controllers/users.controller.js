const User = require('../../../models/user').User,
    Camp = require('../../../models/camp').Camp,
    knex = require('../../../libs/db').knex,
    helperService = require('../services').helperService,
    common = require('../../../libs/common').common;

class UsersController {

    constructor() {
        /**
         * Keep `this` reference
         */
        this.getUserById = this.getUserById.bind(this);
        this.getUserByEmail = this.getUserByEmail.bind(this);
        this.getUserBasic = this.getUserBasic.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.userJoinDetails = this.userJoinDetails.bind(this);
        this.getUsersGroups = this.getUsersGroups.bind(this);
    }

    getUserById(req, res, next) {
        User.forge({ user_id: req.params.id }).fetch({ columns: '*' }).then((user) => {
            if (user !== null) {
                res.json({ name: user.get('name'), email: user.get('email'), cell_phone: user.get('cell_phone') })
            } else {
                res.status(404).json({ message: 'Not found' })
            }
        }).catch((err) => {
            /**
             * Pass the error to be handled by the generic error handler
             */
            return next(err);
        });
    };

    getUserByEmail(req, res, next) {
        User.forge({email: req.params.email}).fetch().then((user) => {
            if (user !== null) {
                res.status(200).end()
            } else {
                res.status(404).end()
            }
        }).catch((err) => {
            /**
             * Pass the error to be handled by the generic error handler
             */
            return next(err);
        })
    };

    getUserBasic(req, res, next) {
        User.forge({user_id: req.params.id}).fetch({
            require: true,
            columns: ['first_name', 'last_name', 'email', 'cell_phone']
        }).then((user) => {
            res.status(200).json({user: user.toJSON()})
        }).catch((err) => {
            /**
             * Pass the error to be handled by the generic error handler
             */
            return next(err);
        });
    }

    getUsers(req, res, next) {
        if (req.user.isAdmin) {
            User.where('validated', '=', '1').fetchAll().then((users) => {
                const _users = users.toJSON();
                for (const i in _users) {
                    common.__updateUserRec(_users[i]);
                }
                return res.status(200).json({users: _users})
            }).catch((err) => {
                return next(err);
            });
        } else {
            res.status(200).json({users: [req.user.toJSON()]})
        }
    }

    userJoinDetails(req, res) {
        if (req.user.isAdmin || req.user.attributes.user_id === parseInt(req.params.user_id)) {
            User.forge({user_id: req.params.user_id}).fetch().then((user) => {
                //this user is not the one is logged in, so the current event Id does not exixts
                //we need to add it from the logged user so getUserCamps will know what to search for
                user.currentEventId = req.user.currentEventId;
                user.getUserCamps((camps) => {
                    const camp = user.attributes.camp;
                    if (user.attributes.camp) {
                        res.status(200).json({
                            details: // camp,
                                {
                                    user_id: user.attributes.user_id,
                                    camp_id: camp.id,
                                    status: camp.member_status,
                                    member_status: camp.member_status,
                                    member_status_i18n: camp.member_status_i18n,
                                    camp_name_en: camp.camp_name_en,
                                    camp_name_he: camp.camp_name_he,
                                }
                        });
                    } else {
                        return helperService.customError(404, 'Couldnt find user available camp', res, true);
                    }
                }, req.t);
            });
        } else {
            // TODO - replace with 403 (check who uses this route in advance) forbidden
            return helperService.customError(404, 'Access denied for user', res, true);
        }
    }

    getUsersGroups(req, res) {
        req.user.getUserCamps(async (camps) => {
            let groups = [];
            let group = {};
            let group_props;
            for (let i in camps) {
                group_props = Camp.prototype.__parsePrototype(camps[i].__prototype, req.user);
                if (['approved', 'pending', 'pending_mgr', 'approved_mgr'].indexOf(camps[i].member_status) > -1) {
                    group = {
                        // group_type:'מחנה נושא',
                        group_id: camps[i].id,
                        group_type: req.t(group_props.t_prefix + 'edit.camp'),
                        member_status: camps[i].member_status,
                        member_status_i18n: camps[i].member_status_i18n,
                        camp_desc_i18n: camps[i].camp_name_he,
                        camp_desc_he: camps[i].camp_name_he,
                        camp_name_en: camps[i].camp_name_en,
                        can_view: ['theme_camp'].indexOf(camps[i].__prototype) > -1,
                        can_edit: camps[i].isManager,
                        is_manager_i18n: camps[i].isManager ? req.t('camps:yes') : req.t('camps:no'),
                    };
                    groups.push(group);
                }
            }
            if (req.user.isAdmin) {
                let query = "SELECT camps.__prototype, SUM(IF(camp_members.status IN ('approved','approved_mgr'),1,0)) AS total FROM camps LEFT JOIN camp_members ON camps.id=camp_members.camp_id WHERE camps.event_id='" + req.user.currentEventId + "' GROUP BY __prototype;";
                let query1 = "SELECT " +
                    "count(*) AS total_tickets" +
                    ",SUM(inside_event) AS inside_event " +
                    ",SUM( IF(first_entrance_timestamp>='2017-01-01%',1,0)) AS ticketing " +
                    ",SUM( IF(first_entrance_timestamp>=NOW() - INTERVAL 1 DAY,1,0)) AS last_24h_first_entrance " +
                    ",SUM( IF(first_entrance_timestamp>=NOW() - INTERVAL 1 HOUR,1,0)) AS last_1h_first_entrance " +
                    ",SUM( IF(entrance_timestamp>=NOW() - INTERVAL 1 DAY,1,0)) AS last_24h_entrance " +
                    ",SUM( IF(last_exit_timestamp>=NOW() - INTERVAL 1 DAY,1,0)) AS last_24h_exit " +
                    ",SUM( IF(entrance_timestamp>=NOW() - INTERVAL 1 HOUR,1,0)) AS last_1h_entrance " +
                    ",SUM( IF(last_exit_timestamp>=NOW() - INTERVAL 1 HOUR,1,0)) AS last_1h_exit " +
                    "FROM tickets  " +
                    "WHERE tickets.event_id='" + req.user.currentEventId +
                    "' GROUP BY event_id; ";

                let stat = {};

                const groupStats = await knex.raw(query);
                stat.groups = {};
                for (let i in groupStats[0]) {
                    stat.groups[groupStats[0][i]['__prototype']] = {
                        total: groupStats[0][i].total
                    };
                }

                // stat.total_tickets = result[0][0]['total_tickets'];
                // stat.inside_event = result[0][0]['inside_event'];
                // stat.ticketing = result[0][0]['ticketing'];
                // stat.last_24h_first_entrance = result[0][0]['last_24h_first_entrance'];
                // stat.last_1h_first_entrance = result[0][0]['last_1h_first_entrance'];
                // stat.last_24h_entrance = result[0][0]['last_24h_entrance'];
                const ticketStats = await knex.raw(query1);

                if (ticketStats && ticketStats[0] && ticketStats[0].length > 0) {
                    stat.total_tickets = ticketStats[0][0]['total_tickets'];
                    stat.inside_event = ticketStats[0][0]['inside_event'];
                    stat.ticketing = ticketStats[0][0]['ticketing'];
                    stat.last_24h_first_entrance = ticketStats[0][0]['last_24h_first_entrance'];
                    stat.last_1h_first_entrance = ticketStats[0][0]['last_1h_first_entrance'];
                    stat.last_24h_entrance = ticketStats[0][0]['last_24h_entrance'];
                    stat.last_24h_exit = ticketStats[0][0]['last_24h_exit'];
                    stat.last_1h_entrance = ticketStats[0][0]['last_1h_entrance'];
                    stat.last_1h_exit = ticketStats[0][0]['last_1h_exit'];
                }

                res.status(200).json({groups: groups, stats: stat});
            } else {
                res.status(200).json({groups: groups});
            }
        }, req, 'all');
    }
}

/**
 * Export singleton
 * @type {UsersController}
 */
module.exports = new UsersController();
