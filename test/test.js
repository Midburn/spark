var should = require('chai').should(); //actually call the function
var app = require('../app.js');
var request = require('supertest')(app);

describe('Login page', function () {
  it('responds to / with redirect to hebrew', function testSlash(done) {
    request
        .get('/')
        .expect('Location','/he/login')
        .expect(302, done);
  });
  
  it('returns 404 MOOP! on everything else', function testPath(done) {
        request
        .get('/foo/bar')
        .expect(/<[Hh]1>MOOP!<\/[Hh]1>/)
        .expect(404,done);
  });

  it('redirects to facebook on facebok login', function facebookRedirect(done) {
       request
      .get('/auth/facebook')
        .expect('Location',/https:\/\/www\.facebook\.com\/dialog\/oauth\?response_type=code&redirect_uri=/)
        .expect(302, done);
  } );
});
