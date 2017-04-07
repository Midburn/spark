var volunteers_model = require('../models/volunteers');
var Department = volunteers_model.Department;
var Role = volunteers_model.VolunteerRole;
var Volunteer = volunteers_model.Volunteer;
//const userRole = require('../libs/user_role');
var DrupalAccess = require('../libs/drupal_acces').DrupalAccess;
var log = require('../libs/logger')(module);

//roles ... consider moving to some other file.
const VOLUNTEER_MANAGER = 0;
const VOLUNTEER_DEPT_MANAGER = 2;
const CURRENT_EVENT = 0;
//GET /volunteer/departments
var get_departments = function (req, res) {
    Department.fetchAll().then(function (deps) {
        res.json(deps.toJSON());
    }).catch((err) => {
        res.status(500).json({
            error: true,
            data: {
                message: err.message
            }
        });
    });
};
//GET /volunteer/volunteers
var get_roles = function (req, res) {
    Role.fetchAll().then(function (deps) {
        res.json(deps.toJSON());
    }).catch((err) => {
        res.status(500).json({
            error: true,
            data: {
                message: err.message
            }
        });
    });
}

function __has_permissions(user_id, perm_level) {
    return new Promise((resolve, reject) => {
        //TODO - check if loggedin user has permissions...
        resolve();

    });
};

function __merge_volunteer_info(vol_data_model, user_info) {
    return {
        role_id: vol_data_model.get('role_id'),
        department_id: vol_data_model.get('department_id'),
        user_id: vol_data_model.get('user_id'),
        first_name: user_info ? user_info.first_name : undefined,
        last_name: user_info ? user_info.last_name : undefined,
        email: user_info ? user_info.email : undefined,
        phone_number: user_info ? user_info.phone : undefined,
        got_ticket: user_info.has_ticket, //TBD
        comment: vol_data_model.get('comment')
    };
}

function __get_voluneer_info(department_id_arr, event_id) {
    return new Promise((resolve, reject) => {
        Volunteer.query((qb) => {
            qb.where('event_id', event_id);
            if (department_id_arr !== undefined) {
                qb.whereIn('department_id', department_id_arr);
            }
        })
            .fetchAll()
            .then((vol_data_col) => {
                log.debug('Found ' + vol_data_col.lengh + ' in dept. ' + department_id_arr);
                var user_ids = vol_data_col.models.map(vol_data => vol_data.get('user_id'));
                DrupalAccess.get_user_info(user_ids)
                    .then(user_data_col => {
                        var result = vol_data_col.models.map((vol_data_model) => {
                            var user_data = user_data_col.find(x => x.uid === vol_data_model.get('user_id'));
                            return __merge_volunteer_info(vol_data_model, user_data.user_data);
                        });
                        resolve(result);
                    });
            });
    });
}

//GET /volunteer/volunteers
var get_volunteers = function (req, res) {
    __has_permissions(1, VOLUNTEER_MANAGER)
        .then(() => {
            return __get_voluneer_info(req.query.department_id, CURRENT_EVENT);
        })
        .then((vol_info_col) => {
            res.status(200).json(vol_info_col);
        })
        .cat
};
//GET /volunteer/department/:department_id/volunteers
var get_department_volunteers = function (req, res) {
    return __has_permissions(1, VOLUNTEER_DEPT_MANAGER)
        .then(() => {
            //find all voluntters
            return __get_voluneer_info([req.params.department_id], CURRENT_EVENT)
        })
        .then((vol_info_col) => {
            res.status(200).json(vol_info_col);
        })
        .catch(err => res.status(403).json({ message: err }));

};
///POST volunteer/department/department_id/volunteers
var post_volunteers = function (req, res) {
    return __has_permissions(1, VOLUNTEER_DEPT_MANAGER)
        .then(() => {
            var mail_addresses = req.body.map(vol_add => vol_add.email);
            var result = [];
            DrupalAccess.get_user_by_email(mail_addresses).then(users_data => {
                Promise.all((mail_addresses.map((mail_addr) => {
                    var data_to_save = users_data ? users_data.find((udata) => udata.email === mail_addr) : undefined;
                    if (data_to_save.user_data === undefined) {
                        result.push({ email: mail_addr, status: 'NotFound' })
                    } else {
                        vol_data = req.body.find(x => x.email === mail_addr);
                        return Volunteer.forge({
                            user_id: data_to_save.user_data.uid,
                            department_id: req.params.department_id,
                            role_id: req.params.role_id,
                            event_id: CURRENT_EVENT
                        }).save().then((save_result) => {
                            log.info('Saved ' + JSON.stringify(save_result));
                            result.push({ email: mail_addr, status: 'OK' });
                        }).catch((err) => {
                            result.push({ email: mail_addr, status: 'AlreadyExists' });
                            log.info('Failed Adding user' + mail_addr + ' to department ' + req.params.department_id + ' ' + err);
                        });
                    }
                }))).then(save_statuses => {
                    res.status(200).json(result)
                }).catch(err => { res.status(500).json({ message: err }) });
            });
        })
        .catch(err => res.status(403).json(err));
};

///PUT volunteer/department/department_id/volunteers/user_id
var put_volunteer = function (req, res) {
    var new_data = {
        role_id: req.body.role_id,
        type_in_shift_id: req.body.shift_type,
        comment: req.body.comment,
        is_production: req.body.is_production
    };
    Volunteer
        .where({ user_id: req.params.user_id, department_id: req.params.department_id, event_id: CURRENT_EVENT })
        .save(new_data, { method: 'update', patch: true })
        .then((vol) => {
            res.status(200).json(vol.toJSON());
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            })
        });
};

var get_volunteering_info = function (req, res) {
    var user_id = req.user.id;
    Volunteer.get_by_user(user_id).then(function (vols) {
        res.json(vols.toJSON());
    }).catch((err) => {
        res.status(500).json({
            error: true,
            data: {
                message: err.message
            }
        });
    });
}

var delete_volunteer = function (req, res) {
    //validate ....
    new Volunteer({ user_id: req.params.user_id, department_id: req.params.department_id })
        .destroy()
        .then(function (model) {
            res.status(200);
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
}

module.exports = function (app, passport) {

    //user story 1
    app.get('/volunteers/info', /*userRole.isLoggedIn(),*/ get_volunteering_info);
    app.get('/volunteers/departments', /*userRole.isLoggedIn(),*/ get_departments);
    app.get('/volunteers/roles', /* userRole.isLoggedIn(), */ get_roles);
    app.get('/volunteers/volunteers', /* userRole.isLoggedIn(), */ get_volunteers);
    //user story 2
    app.get('/volunteers/departments/:department_id/volunteers', /* userRole.isLoggedIn(), */ get_department_volunteers);
    app.post('/volunteers/departments/:department_id/volunteers', /*userRole.isLoggedIn(), */ post_volunteers);
    app.put('/volunteers/departments/:department_id/volunteers/:user_id', /*userRole.isLoggedIn(), */ put_volunteer);
    app.delete('/volunteers/departments/:department_id/volunteers/:user_id', /*userRole.isLoggedIn(),*/ delete_volunteer);
}
