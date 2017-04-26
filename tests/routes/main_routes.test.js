// This is magically used in code such as user.attributes.password.length.should.be.above(20);
var should = require('chai').should(); // eslint-disable-line no-unused-vars

var app = require('../../app');
var request = require('supertest')(app);
var DrupalUser = require('../../models/user').DrupalUser;
var User = require('../../models/user').User;
var knex = require('../../libs/db').knex;

describe('Main routes', function() {
    it('responds to / with redirect to hebrew', function testSlash(done) {
        request
            .get('/')
            .expect('Location', '/he/login?r=/')
            .expect(302, done);
    });

    it('greets in Hebrew', function testSlash(done) {
        request
            .get('/he/login')
            .expect(/כניסה למערכת/)
            .expect(200, done);
    });

    it('greets in English', function testSlash(done) {
        request
            .get('/en/login')
            .expect(/Login/)
            .expect(200, done);
    });

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
            .expect(/Sign up.*Email.*Password/)
            .expect(/www\.google\.com\/recaptcha\/api\.js\?hl=en/)
            .expect(200, done);
    });

    it('returns 404 MOOP! on everything else', function testPath(done) {
        request
            .get('/foo/bar')
            .expect(/<[Hh]1>MOOP!<\/[Hh]1>/)
            .expect(404, done);
    });

    it('redirects to facebook on facebok login', function facebookRedirect(done) {
        request
            .get('/auth/facebook')
            .expect('Location', /https:\/\/www\.facebook\.com\/dialog\/oauth\?response_type=code&redirect_uri=/)
            .expect(302, done);
    });

    it('logs-in a drupal user', function loginDrupalUser(done) {
        var email = 'omerpines@hotmail.com';
        // var hashed_password = '$S$DX1KmzFZtwY3VOgioPlO8vqXELOs4VisHPzMQ5mP6sYI.MJpHpXs';
        var clear_password = '123456';
        Promise.all([
                knex(User.prototype.tableName).where('email', email).del(),
                knex(DrupalUser.prototype.tableName).where('name', email).del()
            ])
            // .then(function () {
            //     return DrupalUser.forge({
            //         name: email,
            //         pass: hashed_password,
            //         status: 1
            //     }).save();
            // })
            .then(function() {
                return request
                    .post('/he/login')
                    .send({
                        email: email,
                        password: clear_password
                    })
                    .expect(302)
                    .expect('Location', 'home');
            }).then(function() {
                // spark user should be updated with email and password
                return User.forge({
                    email: email
                }).fetch().then(function(user) {
                    user.attributes.password.length.should.be.above(20);
                    user.attributes.email.should.equal(email);
                });
            }).then(done);
    });
});
