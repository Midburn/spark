// var config = require('config');
var request = require('request');

module.exports = function (app, passport) {
    /**
   * API: (GET)   
   * request => /api/userlogin
   * params  => username, password
   * usage sample => http://localhost:3000/api/userlogin?username=Profile_Username&password=Profile_Password
   */
    app.get('/api/userlogin', (req, res, next) => {
        // console.log(req);
        req.query.username = 'asaf@omc.co.il';
        req.query.password = 'asiOMC769';
        request({
            url: 'https://profile-test.midburn.org/api/user/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            form: { 'username': req.query.username, 'password': req.query.password }
        },
            function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log(body);
                    var data=JSON.parse(body);
                    if (body.indexOf('token') > 0) {
                        res.status(200).jsonp({ status: 'true', 'massage': 'user authorized', 'data': data });
                    }
                    else {
                        res.status(401).jsonp({ status: 'false', 'massage': 'Not authorized!!!' });
                    }
                }
                else {
                    res.status(401).jsonp({ status: 'false', 'massage': 'Not authorized!!!' });
                }
            });
    });

    /*
        /////  POST not tested yet :-( ////
        app.post('/api/userlogin', (req, res, next) => {
            console.log(req);
    
            request({
                url: 'https://profile-test.midburn.org/api/user/login',
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                form: { 'username': req.query.username, 'password': req.query.password }
            },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(body);
    
                        //need to implement more currect way to validate response.
                        if (body.indexOf('token') > 0) {
                            //you can return any needed data from the body.
                            res.status(200).jsonp({ status: 'true', 'massage': 'user authorized' });
                        }
                        else {
                            res.status(401).jsonp({ status: 'false', 'massage': 'Not authorized!!!' });
                        }
                    }
                    else {
                        res.status(401).jsonp({ status: 'false', 'massage': 'Not authorized!!!' });
                    }
                });
        });*/

};
