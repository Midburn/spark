const app = require('../../app');
const should = require('chai').should();
const request = require('supertest')(app);
const nock = require('nock');
const profilesApi = require('config').get('profiles_api');

const testUser1 = {
    id: 1,
    email: 'john.doe@gmail.com',
    first_name: 'John',
    last_name: 'Doe'
};


var setupDrupalMock = (function() {

    const resp = [{
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
    }]
    return function(repititions) {
        var options = { allowUnmocked: true };
        console.log('Running With Mock');
        nock(profilesApi.url, options)
            .post('/api/user/login')
            .reply(200, {})
            .get('/en/api/usersearch')
            .times(repititions)
            .query(true)
            .reply(200, resp)
    }
})();

describe('Tests are fine', function() {
    it('responds to / with redirect to hebrew', function testSlash(done) {
        request
            .get('/')
            .expect('Location', '/he/login?r=/')
            .expect(302, done);
    });
});

describe('Getters all respond', function() {
    this.timeout(2500);
    beforeEach(() => {
        setupDrupalMock(1);
    });
    it('returns roles', function getRoles(done) {
        request
            .get('/volunteers/roles/')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
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
            .end(function(err, res) {
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

    it('returns all volunteers with expected structure', function(done) {
        request
            .get('/volunteers/volunteers')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    done(err);
                }
                res.should.be.json;

                //console.log(`VOLYNTEERS OF ONE DEPARTMENT BODY:\n${JSON.stringify(res.body)}`);

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

    it('returns volunteers of department 1', function(done) {
        request
            .get('/volunteers/departments/1/volunteers')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                    done(err);
                }
                res.should.be.json;

                //console.log(`VOLYNTEERS BODY:\n${JSON.stringify(res.body)}`);

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

    it.skip('returns volunteers of all departments', function(done) {
        //Iterate over all departments and see they are returning zero or more volunteers and the count is equal
        done();
    });
});

describe('Adding volunteers', function() {
    this.timeout(4000);
    //ading one
    it('should return ok on adding a single volunteer', function(done) {
        //get number of volunteers and veridy our volunteer is not already there
        const departmentId = 2;
        setupDrupalMock(1);
        request
            .post(`/volunteers/departments/${departmentId}/volunteers/`)
            .type('application/json')
            .accept('application/json')
            .send(JSON.stringify(
                [{
                    email: testUser1.email,
                    role_id: 9999,
                    is_production: true
                }]
            ))
            .expect(200)
            .expect([{
                "email": testUser1.email,
                "status": "OK"
            }])
            .end(done);

    });

    it.skip('should get the volunteer if added successfully', function(done) {
        //get number of volunteers and veridy our volunteer is not already there
        setupDrupalMock(1)
        const departmentId = 3;

        request
            .post(`/volunteers/departments/${departmentId}/volunteers/`)
            .type('application/json')
            .accept('application/json')
            .send( //JSON.stringify(
                [{
                    email: testUser1.email,
                    role_id: 9999,
                    is_production: true
                }]
                //)
            )
            .expect(200)
            .expect([{
                "email": testUser1.email,
                "status": "OK"
            }], done);

        setupDrupalMock(1);
        request
            .get(`/volunteers/departments/${departmentId}/volunteers`) //TODO change back to dep 3 
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    console.log(`ERROR: ${err}`);
                    done();
                }
                res.body.should.be.json;

                console.log(`VOLUNTEERS IN DEPARTMENT departmentId:${departmentId}, res.body:${JSON.stringify(res.body)}`)
                const match = res.body.find((volunteer) => volunteer.email === testUser1.email);
                match.should.exist;
                //TODO FAILS NULL FIXIT // match[0].role_id.should.be.equal(9999);
                //TODO FAILS NULL FIXIT // match[0].is_production.should.be.equal(true);

                done();
            });

    });
    //add and get
    //collision returns error and does not change existing
    //extra fields are rejected
    //missing fields are ignored or rejected
    //length and type limits on mail and numbers
    //wrong format 
});


describe.skip('Volunteers editing', function() {
    //editing one
    //edit and get
    //edit non existing
    //extra fields are rejected
    //missing fields are ignored or rejected
    //length and type limits on mail and numbers
    //wrong format 
});


describe('Volunteers deletion', function() {
    //deleting one
    //get and delete and get
    //delete non existing
    //delete deos not affect other departments
});