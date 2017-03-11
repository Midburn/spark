var volunteers_model = require('../models/volunteers');
var Department = volunteers_model.Department;
var Role = volunteers_model.Role;
var Volunteer = volunteers_model.Volunteer;

var not_implemented = function(req, res) {
    res.status(501).json({ message: "Not Implemented" });
}

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
}

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
}

var get_volunteers = function(req, res) {
    if (__is_dep_vol_manager(1)) {

    } else {
        res.status(401).json({ message: "Not Authorized" });
    }

}

var get_department_volunteers = function(req, res) {
    not_implemented(req, res);
}

var post_volunteers = function(req, res) {
    not_implemented(req, res);
}

var put_volunteer = function(req, res) {
    not_implemented(req, res);
}

var get_volunteering_info = function(req, res) {
    Volunteer.get_by_user(1).then(function(deps) {
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
    not_implemented(req, res);
}

module.exports = function(app, passport) {

    //user story 1
    app.get('/volunteers/info', get_volunteering_info);
    app.get('/volunteers/departments', get_departments);
    app.get('/volunteers/roles', get_roles);
    app.get('/volunteers/volunteers', get_volunteers);
    //user story 2
    app.get('/volunteer/department/:department_id/volunteers', get_department_volunteers);
    app.post('/volunteer/department/:department_id/volunteers', post_volunteers);
    app.put('/volunteer/department/:department_id/volunteers/:user_id', put_volunteer);
    app.delete('/volunteer/department/:department_id/volunteers/:user_id', delete_volunteer);
}