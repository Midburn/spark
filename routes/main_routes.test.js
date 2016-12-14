var should = require('chai').should(); //actually call the function
var app = require('../app.js');
var request = require('supertest')(app);

describe('Main routes', function () {
  it('responds to / with redirect to hebrew', function testSlash(done) {
    request
        .get('/')
        .expect('Location','/he/login')
        .expect(302, done);
  });

    it('greets in Hebrew', function testSlash(done) {
    request
        .get('/he/login')
        .expect(/ברוכים הבאות/)
        .expect(200, done);
  });
  
  it('greets in English', function testSlash(done) {
    request
        .get('/en/login')
        .expect(/Welcome to Spark/)
        .expect(200, done);
  });


  it('shows signup formin Hebrew', function testSlash(done) {
    request
        .get('/he/signup')
        .expect(/הרשמה.*סיסמה/)
        .expect(200, done);
  });
  
  it.only('shows signup form in English', function testSlash(done) {
    request
        .get('/en/signup')
        .expect(/Sign Up.*Email.*Password/)
        .expect(200, done);
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
