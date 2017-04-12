process.env.NODE_ENV = 'testing'

var should = require('should'); // eslint-disable-line no-unused-vars

var Nightmare = require('nightmare');

// Set different ports so we can run tests while dev server is running
process.env.WEB_PORT = 3000

// Web tests
require('../../server');

console.log("~~~~ Webpack & API servers up, starting e2e tests ~~~~")

var url = `http://localhost:${process.env.WEB_PORT}`;
var testTimeout = 30000

function newNightmare() {
    return new Nightmare({
        show: true,
        waitTimeout: testTimeout,
        executionTimeout: testTimeout
    })
}

describe('Home page', function () {
    this.timeout(testTimeout);

    it('should show login form when loaded', function (done) {
        newNightmare()
            .goto(url)
            .evaluate(function () {
                return document.querySelectorAll('#login_email').length;
            })
            .run(function (err, result) {
                should.not.exist(err);
                result.should.equal(1);
                done();
            })
            .catch(done);
    });
});

describe('Forgot Password Page', function () {
    var email = 'ron.gross@gmail.com';
    this.timeout(testTimeout);

    // TODO: Fix this test
    xit('Should say email was sent when a valid email is entered', function (done) {
        newNightmare()
            .goto(url)
            .click('#login_email')
            .type('.form-group input', email)
            .click('#reset-password-btn')
            .wait('.alert-success')
            .evaluate(function () {
                return document.querySelectorAll('.alert-success"').length;
            })
            .run(function (err, result) {
                should.not.exist(err);
                result.should.equal(1);
                done();
            })
            .catch(done);
    });
});
