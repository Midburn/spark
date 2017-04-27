// This is magically used in code such as user.attributes.password.length.should.be.above(20);
const should = require('chai').should(); // eslint-disable-line no-unused-vars
const Cookies = require('expect-cookies');
const app = require('../../app');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const request = require('supertest')(app);
const assert = require('assert');
const sessionTestSupport = require('../libs/session-test-support');
const SessionCookieName = require('../../libs/spark-express-session').SessionCookieName;
const TestValidCredentials = {username: 'a', password: 'a'};
// const TestValidCredentials = {username: 'xnowvvra@sharklasers.com', password: '123456'};

const sessionToken = () => {
    const token = sessionTestSupport.createSession();
    return `${SessionCookieName}=${token}`;
};

const UserLoginUrl = '/jwt-login';

describe.only('API routes', function() {

    before(() => {
        console.log('before');
        return request.get('/dev/create-admin')
    });

    it.only('should reject with no token', () =>
        request.post(UserLoginUrl)
               .expect(401));

    it('should reject with invalid login', () =>
        request.post(UserLoginUrl)
               .send({
                   username: "none",
                   password: "invalid"
                })
               .expect(401));

    it('should return 200OK if encountered valid token', () =>
        request.post(UserLoginUrl)
               .set('cookie', sessionToken())
               .expect(200));

    it('should set cookie when login is successful', () =>
        request.post(UserLoginUrl)
               .send(TestValidCredentials)
               .expect(200)
               .expect(Cookies.new({'name': SessionCookieName, 'options': ['path', 'httponly', 'max-age']})));

    it('login and then try to access another api with token', () =>
        request.post(UserLoginUrl)
                      .send(TestValidCredentials)
                      .then(res => {
                          const sessionToken = res.headers['set-cookie'][0].split(';')[0].split('=')[1]
                          return request.post(UserLoginUrl)
                                        .set('cookie', `${SessionCookieName}=${sessionToken}`)
                                        .expect(200);
                      }));
});
