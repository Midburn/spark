// This is magically used in code such as user.attributes.password.length.should.be.above(20);
const modules = require('../../libs/modules');
var should = require('chai').should(); // eslint-disable-line no-unused-vars
var app = modules.require('core', 'app.js');
var request = require('supertest')(app);
var DrupalUser = modules.require('users', 'models/user').DrupalUser;
var User = modules.require('users', 'models/user').User;
var knex = modules.require('core', 'libs/db').knex;

describe('Users routes', function () {

    it('shows signup form in Hebrew', function testSlash(done) {
        request
            .get('/he/signup')
            .expect(/הרשמה.*סיסמה/)
            .expect(/www\.google\.com\/recaptcha\/api\.js\?hl=he/)
            .expect(200, done);
    });

    it('shows signup form in English', function testSlash(done) {
        request
            .get('/en/signup')
            .expect(/Sign Up.*Email.*Password/)
            .expect(/www\.google\.com\/recaptcha\/api\.js\?hl=en/)
            .expect(200, done);
    });

    it('logs-in a drupal user', function loginDrupalUser(done) {
        var email = 'main_routes_test@localhost';
        var hashed_password = '$S$DX1KmzFZtwY3VOgioPlO8vqXELOs4VisHPzMQ5mP6sYI.MJpHpXs';
        var clear_password = 'paK4AMUTopVYneHoxCni';
        Promise.all([
            knex(User.prototype.tableName).where('email', email).del(),
            knex(DrupalUser.prototype.tableName).where('name', email).del()
        ]).then(function () {
            return DrupalUser.forge({
                name: email,
                pass: hashed_password,
                status: 1
            }).save();
        }).then(function () {
            return request
                .post('/he/login')
                .send({
                    email: email,
                    password: clear_password
                })
                .expect(302)
                .expect('Location', 'home');
        }).then(function () {
            // spark user should be updated with email and password
            return User.forge({
                email: email
            }).fetch().then(function (user) {
                user.attributes.password.length.should.be.above(20);
                user.attributes.email.should.equal(email);
            });
        }).then(done);
    });
});
