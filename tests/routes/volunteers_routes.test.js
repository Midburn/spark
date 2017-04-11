const app = require('../../app');
const should = require('chai').should();
const request = require('supertest')(app);


const testUser1 = {
    id: 1,
    email: 'it@midburn.com',
    first_name: 'Master',
    last_name: 'burner'
};

describe('Tests are fine', function () {
    it('responds to / with redirect to hebrew', function testSlash(done) {
        request
            .get('/')
            .expect('Location', '/he/login?r=/')
            .expect(302, done);
    });
});

describe('Getters all respond', function () {
    this.timeout(2500);
    it('returns roles', function getRoles(done) {
        request
            .get('/volunteers/roles/')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    console.log(err);
                    done(err);
                }
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.be.greaterThan(2);

                const role = res.body[0];
                role.should.exist;
                role.should.have.property('id');
                role.should.have.property('name');

                done();
            });
    });

    it('returns departments', function getDeprtments(done) {
        request
            .get('/volunteers/departments/')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    console.log(err);
                    done(err);
                }
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.be.greaterThan(2);

                //console.log(`DEPARTMENTS BODY:\n${JSON.stringify(res.body)}`);

                const department = res.body[0];
                department.should.exist;
                department.should.have.property('id');
                //TODO FAILS department.should.have.property('name'); //Uncaught AssertionError: expected { Object (id, name_en, ...) } to have a property 'name'
                department.should.have.property('name_en');
                department.should.have.property('name_he');

                done();
            });
    });

    it('returns volunteers', function (done) {
        request
            .get('/volunteers/volunteers')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    console.log(err);
                    done(err);
                }
                res.should.be.json;

                console.log(`VOLYNTEERS BODY:\n${JSON.stringify(res.body)}`);

                res.body.should.be.a('array');
                res.body.length.should.be.greaterThan(0);


                const volunteer = res.body[0];
                volunteer.should.have.property('department_id');
                volunteer.should.have.property('user_id'); //TODO test should not be null
                volunteer.should.have.property('first_name');
                volunteer.should.have.property('last_name');
                volunteer.should.have.property('email');
                volunteer.should.have.property('phone_number');
                //TODO FAILS volunteer.should.have.property('is_production');
                volunteer.should.have.property('role_id');
                done();
            });
    });

    it.skip('returns volunteers of department 1', function (done) {
        request
            .get('/volunteers/departments/1/volunteers')
            .expect(200, done);
    });

    it.skip('reuturns volunteers of all departments', function (done) {
        //Iterate over all departments and see they are returning zero or more volunteers and the count is equal
        done();
    });
});

describe('Adding volunteers', function () {
    //ading one
    it('should add a single volunteer successfully', function (done) {
        //get number of volunteers and veridy our volunteer is not already there
        const departmentId = 2;
        request
            .post(`/volunteers/departments/${departmentId}/volunteers/`)
            .type('application/json')
            .accept('application/json')
            .send( //JSON.stringify(
                {
                    email: testUser1.email,
                    role_id: 9999,
                    is_production: true
                }
                //)
            )
            .expect(200)
            .expect([{
                "email": testUser1.email,
                "status": "OK"
            }], done);

    });
    //add and get
    //collision returns error and does not change existing
    //extra fields are rejected
    //missing fields are ignored or rejected
    //length and type limits on mail and numbers
    //wrong format 
});


describe.skip('Volunteers editing', function () {
    //editing one
    //edit and get
    //edit non existing
    //extra fields are rejected
    //missing fields are ignored or rejected
    //length and type limits on mail and numbers
    //wrong format 
});


describe('Volunteers deletion', function () {
    //deleting one
    //get and delete and get
    //delete non existing
    //delete deos not affect other departments
});
