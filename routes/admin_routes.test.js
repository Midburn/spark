var should = require('chai').should(); //actually call the function
var app = require('../app.js');
var request = require('supertest').agent(app);
var DrupalUser = require('../models/user').DrupalUser;
var User = require('../models/user').User;
var knex = require('../libs/db').knex;
var constants = require('../models/constants');
var _ = require('lodash');

const ADMIN_USER_EMAIL = "omerpines@hotmail.com";
const ADMIN_USER_PASSWORD = "123456";
const ADMIN_USER_FIRST_NAME = "Omer Hatotach";

var adminLoggedIn = false;

var givenAdminUserIsRegistered = function() {
    return User.forge({
        email: ADMIN_USER_EMAIL
    }).fetch().then(function(user) {
        if (user) {
            console.log('user already exists...!'+user.attributes.roles);
            return user.save({roles:'admin'});
            // return Promise.resolve(user);
        } else {
            var newUser = new User({
                email: ADMIN_USER_EMAIL,
                first_name: ADMIN_USER_FIRST_NAME,
                last_name: 'test user',
                gender: 'female',
                validated: true,
                roles: 'admin'
            });
            newUser.generateHash(ADMIN_USER_PASSWORD);
            console.log('creating new user');
            return newUser.save();
        }
    });
};

var givenAdminUserIsLoggedIn = function() {
    if (!adminLoggedIn) {
        adminLoggedIn = true;
        return givenAdminUserIsRegistered().then(function() {
            return request
                .post('/he/login')
                .send({
                    email: ADMIN_USER_EMAIL,
                    password: ADMIN_USER_PASSWORD,
                    r: "/admin"
                })
                .expect(302)
                .expect('Location', '/admin');
        });
    } else {
        return Promise.resolve();
    }
};

var adminHomeShouldShowSomeData = function() {
    return request.get('/he/admin').expect(200).expect(function(res) {
        if (
            (res.text.indexOf("Total Users") < 0) ||
            (res.text.indexOf("Total Camps") < 0)
        ) {
            throw new Error();
        }
    });
};

var givenUserAdminTableAjaxUrl = function() {
    // TODO: build dynamically
    return '/admin/users/table?draw=1&columns%5B0%5D%5Bdata%5D=user_id&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=true&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=email&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=first_name&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=last_name&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=actions&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=1&order%5B0%5D%5Bdir%5D=asc&start=0&length=5&search%5Bvalue%5D=&search%5Bregex%5D=false&_=1486902267934';
};

var adminTableAjaxShouldContainAdminUser = function() {
    return request.get(givenUserAdminTableAjaxUrl()).expect(200).expect(function(res) {
        console.log("loaded information:"+res.text);
        _(JSON.parse(res.text).data)
            .find({
                email: ADMIN_USER_EMAIL,
                first_name: ADMIN_USER_FIRST_NAME
            })
            .should.include.keys('user_id', 'email', 'first_name', 'last_name');
    });
};

var givenAdminUserEditPageUrl = function() {
    return User.forge({
        email: ADMIN_USER_EMAIL
    }).fetch().then(function(user) {
        return "/admin/users/edit/" + user.id;
    })
};

var shouldShowEditAdminUserPage = function() {
    return givenAdminUserEditPageUrl()
        .then(function(admin_user_edit_page_url) {
            return request.get(admin_user_edit_page_url).expect(200).expect(function(res) {
                res.text.should.contain('Edit User');
                res.text.should.contain(ADMIN_USER_EMAIL);
                res.text.should.contain(ADMIN_USER_FIRST_NAME);
                res.text.should.not.contain(ADMIN_USER_PASSWORD);
            });
        });
};

var givenAdminUserLastNameIs = function(last_name) {
    return User.where('email', '=', ADMIN_USER_EMAIL).save({
        last_name: last_name
    }, {
        method: "update",
        patch: true
    });
};

var shouldChangeAdminUserLastNameTo = function(last_name) {
    return givenAdminUserEditPageUrl()
        .then(function(admin_user_edit_page_url) {
            return request.post(admin_user_edit_page_url).send({
                last_name: last_name
            }).expect(200);
        })
        .then(function() {
            return User.forge({
                email: ADMIN_USER_EMAIL
            }).fetch();
        }).then(function(user) {
            user.attributes.last_name.should.equal(last_name + "");
        });
};

describe('Admin routes', function() {
    it('should show some statistical data on admin homepage', function() {
        this.timeout(5000);
        return givenAdminUserIsLoggedIn().then(adminHomeShouldShowSomeData);
    });

    // it('should show admin user in users table', function() {
    //     return givenAdminUserIsLoggedIn().then(adminTableAjaxShouldContainAdminUser);
    // });

    // it('should show edit user page', function() {
    //     return givenAdminUserIsLoggedIn().then(shouldShowEditAdminUserPage);
    // });

    it('should allow to edit a user', function() {
        return givenAdminUserIsLoggedIn()
            .then(_.partial(givenAdminUserLastNameIs, 'foobar'))
            .then(_.partial(shouldChangeAdminUserLastNameTo, 'bazbax'));
    })
});
