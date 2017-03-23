var request = require('request');

module.exports = function (app) {
   
    /**
   * API: (GET)   
   * request => /api/userlogin
   * params  => username, password
   * usage sample => http://localhost:3000/api/userlogin?username=Profile_Username&password=Profile_Password
   */
    app.get('/api/userlogin', (req, res) => {
        console.log(req);
        request({
            url: 'https://profile.midburn.org/api/user/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            form: { 'username': req.query.username, 'password': req.query.password }
        },
            function (error, response, body) {
                if (!error && response.statusCode === 200) {

                    var drupalUser  = JSON.parse(body);    
                     console.log(drupalUser);     

                    res.status(200).jsonp({ 
                        status: 'true',
                        'massage': 'user authorized' ,
                        'uid': drupalUser.user.uid,
                        'username': drupalUser.user.name,
                        'token': drupalUser.sessid,
                        "firstname": drupalUser.user.field_profile_first.und[0].value,
                        "lastname": drupalUser.user.field_profile_last.und[0].value,
                        "phone": drupalUser.user.field_profile_phone.und[0].value                   
                    });
                }
                else {
                    res.status(401).jsonp({ status: 'false', 'massage': 'Not authorized!','error':JSON.parse(body) });
                }
            });
    });

   
};

