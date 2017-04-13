const _ = require('lodash');

var profiles = (function() {
    const profiles = [{
            password: '123',
            email: 'spark.superuser@midburn.org',
            uid: '1',
            response: {
                'uid': '1',
                'Active': 'Yes',
                'E-mail': '<a href="mailto:spark.superuser@midburn.org">spark.superuser@midburn.org</a>',
                'Uid': '<a href="/en/users/itmidburncom">1</a>',
                'PHP': 'asdasdad',
                'name': '<a href="/en/users/jhondoe" title="View user profile." class="username">john.doe@g...</a>',
                'First name': 'superuser',
                'I.D. or Passport #': { 'error': 'Access denied or format unknown on field.' },
                'Last name': 'superuser',
                'Phone number': '054112233555'
            }
        },
        {
            password: '123456',
            email: 'jane.doe@gmail.com',
            uid: '333',
            response: {
                'uid': '333',
                'Active': 'Yes',
                'E-mail': '<a href="mailto:jone.doe@gmail.com">jane.doe@gmail.com</a>',
                'Uid': '<a href="/en/users/itmidburncom">1</a>',
                'PHP': 'asdasdad',
                'name': '<a href="/en/users/jhondoe" title="View user profile." class="username">john.doe@g...</a>',
                'First name': 'Jane',
                'I.D. or Passport #': { 'error': 'Access denied or format unknown on field.' },
                'Last name': 'Doe',
                'Phone number': '054112233551'
            }
        },
        {
            password: '123456',
            email: 'john.doe@gmail.com',
            uid: '222',
            response: {
                'uid': '222',
                'Active': 'Yes',
                'E-mail': '<a href="mailto:john.doe@gmail.com">john.doe@gmail.com</a>',
                'Uid': '<a href="/en/users/itmidburncom">1</a>',
                'PHP': 'asdasdad',
                'name': '<a href="/en/users/jhondoe" title="View user profile." class="username">john.doe@g...</a>',
                'First name': 'John',
                'I.D. or Passport #': { 'error': 'Access denied or format unknown on field.' },
                'Last name': 'Doe',
                'Phone number': '054112233555'
            }
        }
    ]
    return {
        checkPassword: function(email, password) {
            let profile = _.find(profiles, x => x.email === email);
            return profile && profile.password === password;
        },
        find: function(email, uid) {
            let profile = _.find(profiles, x => (x.email === email) || (x.uid === uid));
            if (profile) {
                return profile.response;
            }
        }
    }

})();

module.exports = function(app, _) {
    app.post('/fake_drupal/api/user/login', (req, res) => {
        var email = req.body.username;
        var password = req.body.password;
        if (profiles.checkPassword(email, password)) {
            res.json(profiles.find(email));
        } else {
            res.status(403).end();
        }
    });

    app.get('/fake_drupal/en/api/usersearch', (req, res) => {
        var query = req.query;
        response = profiles.find(query.mail, query.uid)
        res.json([response]);
    });
}