var volunteers_model = require('../models/volunteers');
var Department = volunteers_model.Department;
var Role = volunteers_model.Role;
var Volunteer = volunteers_model.Volunteer;
const userRole = require('../libs/user_role');

var not_implemented = function(req, res) {
    res.status(501).json({ message: "Not Implemented" });
};
//GET /volunteer/departments
var get_departments = function(req, res) {
    Department.fetchAll().then(function(deps) {
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
var get_roles = function(req, res) {
    Role.fetchAll().then(function(deps) {
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

function __is_dep_vol_manager(user_id) {
    return true;
};
//GET /volunteer/volunteers
var get_volunteers = function(req, res) {
    if (__is_dep_vol_manager(req.user.id)) {
        //var user_ids = [1]; //find user by name or email and by ticket.
        Volunteer.query((qb) => {
            if (req.query.deps !== undefined) {
                qb.whereIn('department_id', req.query.deps);
            }
            if (req.query.roles !== undefined) {
                qb.whereIn('role_id', req.query.roles);
            }
        }).fetchAll().then((vols) => {
            if (res === null) {
                res.json('[]')
            }
            res.json(vols.toJSON());
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    } else {
        res.status(401).json({ message: "Not Authorized" });
    }
};
//GET /volunteer/department/:department_id/volunteers
var get_department_volunteers = function(req, res) {
    if (__is_dep_vol_manager(req.user.id)) {
        Volunteer.query((qb) => {
            qb.whereIn('department_id', req.params.department_id);
            if (req.query.roles !== undefined) {
                qb.whereIn('role_id', req.query.roles);
            }
        }).fetchAll().then((vols) => {
            if (res === null) {
                res.json('[]')
            }
            res.json(vols.toJSON());
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    } else {
        res.status(401).json({ message: "Not Authorized" });
    }
};
///POST volunteer/department/department_id/volunteers
var post_volunteers = function(req, res) {
    if (__is_dep_vol_manager(req.user.id) && req.body !== undefined) {
        for (var index = 0; index < array.body.length; index++) {
            var element = req.body[index];
            console.log('Will add ' + JSON.stringify(element));
            //TODO get user_ids.... add to vaolunteers table.
        }
    } else {
        res.status(401).json({ message: "Not Authorized" });
    }
}

var put_volunteer = function(req, res) {
    not_implemented(req, res);
}

var get_volunteering_info = function(req, res) {
    var user_id = req.user.id;
    Volunteer.get_by_user(user_id).then(function(deps) {
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

var delete_volunteer = function(req, res) {
    //validate ....
    new Volunteer({ user_id: req.params.user_id, department_id: req.params.department_id })
        .destroy()
        .then(function(model) {
            res.json('');
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
}

module.exports = function(app, passport) {

    //user story 1
    app.get('/volunteers/info', userRole.isLoggedIn(), get_volunteering_info);
    app.get('/volunteers/departments', userRole.isLoggedIn(), get_departments);
    app.get('/volunteers/roles', userRole.isLoggedIn(), get_roles);
    app.get('/volunteers/volunteers', userRole.isLoggedIn(), get_volunteers);
    //user story 2
    app.get('/volunteer/department/:department_id/volunteers', userRole.isLoggedIn(), get_department_volunteers);
    app.post('/volunteer/department/:department_id/volunteers', post_volunteers);
    app.put('/volunteer/department/:department_id/volunteers/:user_id', put_volunteer);
    app.delete('/volunteer/department/:department_id/volunteers/:user_id', delete_volunteer);
}