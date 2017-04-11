const app = require('../../app');
const should = require('chai').should();
const request = require('supertest')(app);


describe('Tests are fine', function () {
    it('responds to / with redirect to hebrew', function testSlash(done) {
        request
            .get('/')
            .expect('Location', '/he/login?r=/')
            .expect(302, done);
    });
});

describe('Getters all respond', function () {
    it('returns roles', function getRoles(done) {
        request
            .get('/volunteers/roles')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    console.log(err);
                    done(err);
                }
                res.should.be.json;
                res.body.should.be.a('array');
                const roles = res.body;
                roles.length.should.be.greaterThan(2);
                console.log('ROLES IS:');
                console.log(roles);
                roles[0].should.have.property('id');
                roles[0].should.have.property('name');

                done();
            });

    });
});
