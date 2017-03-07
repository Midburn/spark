var volunteers_model = require('../models/volunteers');
var Department = volunteers_model.Department;
var Role = volunteers_model.Role;

var not_implemented = function(req, res) {
    res.status(501).json({message: "Not Implemented"});
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

var get_volunteers = function(req, res) {
    not_implemented(req, res);
}

var get_department_volunteers = function(req, res) {
    not_implemented(req, res);
}

var post_volunteers = function(req, res) {
    not_implemented(req,res);
}

var put_volunteer = function(req, res) {
    not_implemented(req,res);
}

var get_volunteering_info = function(req, res) {
    not_implemented(req, res);
}

var delete_volunteer = function(req, res) {
    not_implemented(req, res);
}

module.exports = function (app, passport) {

    app.get('/volunteers/info', get_volunteering_info);
    app.get('/volunteers/departments', get_departments);
    app.get('/volunteers/roles', get_roles);
    app.get('/volunteer/volunteers', get_volunteers);
    app.get('/volunteer/department/:department_id/volunteers', get_department_volunteers);
    app.post('/volunteer/department/:department_id/volunteers', post_volunteers);
    app.put('/volunteer/department/:department_id/volunteers/:user_id', put_volunteer);
    app.delete('/volunteer/department/:department_id/volunteers/:user_id', delete_volunteer);
}