// This is magically used in code such as user.attributes.password.length.should.be.above(20);
var should = require('chai').should(); // eslint-disable-line no-unused-vars

var app = require('../../app');
var request = require('supertest')(app);
var User = require('../../models/user').User;
var knex = require('../../libs/db').knex;
const assert = require('assert');
const TEST_TOKEN = "YWxseW91bmVlZGlzbG92ZWFsbHlvdW5lZWRpc2xvdmVsb3ZlbG92ZWlzYWxseW91";

describe('API routes', function() {
    it('should reject with no token', function() {
        return request
            .post('/api/userlogin')
            .expect(401);
    });

    it('should reject with invalid token', function() {
        return request
            .post('/api/userlogin')
            .send({
                token: "INVALID"
            })
            .expect(401);
    });

    it('should reject with invalid login', function() {
        return request
            .post('/api/userlogin')
            .send({
                username: "none",
                password: "invalid",
                token: TEST_TOKEN
            })
            .expect(401)
    });

    it('should login', function() {
        return request
            .post('/api/userlogin')
            .send({
                username: "omerpines@hotmail.com",
                password: "123456",
                token: TEST_TOKEN
            })
            .expect(200)
    });

});