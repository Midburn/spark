const User = require('../models/user').User,
    campsService = require('../../services/camps.service');

class UsersController {

    getAll(req, res) {
        if (req.user.isAdmin) {
            User.where('validated', '=', '1').fetchAll().then((users) => {
                const _users = users.toJSON();
                for (const i in _users) {
                    common.__updateUserRec(_users[i]);
                }
                res.status(200).json({ users: _users })
            }).catch((err) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        } else {
            res.status(200).json({ users: [req.user.toJSON()] })
        }
    }

    getById(req, res) {
        User.forge({ user_id: req.params.id }).fetch({ columns: '*' })
            .then((user) => {
                if (user !== null) {
                    res.json({
                        name: user.get('name'),
                        email: user.get('email'),
                        cell_phone: user.get('cell_phone')
                    })
                } else {
                    res.status(404).json({ message: 'Not found' })
                }
            })
            .catch((err) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
    }

    getByEmail(req, res) {
        User.forge({ email: req.params.email }).fetch().then((user) => {
            if (user !== null) {
                res.status(200).end()
            } else {
                res.status(404).end()
            }
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    }

    updateCampStatus(action) {
        const user_id = req.user.attributes.user_id;
        const camp_id = req.params.id;
        return (req, res) => {
            return campsService.campStatusUpdate(req.user.currentEventId, camp_id, user_id, action, user_id, res)
        }
    }

    joinCamp(req, res) {
        const user_id = req.params.id;
        if (req.user.isAdmin || req.user.attributes.user_id === parseInt(user_id)) {
            User.forge({ user_id }).fetch()
                .then((user) => {
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
                            res.status(404).json({
                                error: true,
                                data: {
                                    message: 'Couldnt find user available camp',
                                }
                            });
                        }
                    }, req.t);
                });
        } else {
            res.status(404).json({
                error: true,
                data: {
                    message: 'Access denied for user',
                }
            });
        }
    };
}

module.exports = new UsersController();

