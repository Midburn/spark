const expect = require('chai').expect;
const MidburnSessionCrypto = require('../../libs/midburn-session-crypto');
const sessionTestSupport = require('./session-test-support');

describe('midburn session crypto', () => {
    it('should fail creating MidburnSessionCrypto without mainKey', () => {
        expect(() => new MidburnSessionCrypto()).to.throw(Error, 'pubKey is mandatory');
    });

    it('should convert pubKey into correct format', () => {
        const validSessionToken = sessionTestSupport.createSession({});
        new MidburnSessionCrypto(sessionTestSupport.validKeyInInvalidFormat).decrypt(validSessionToken);
    });

    it('should decrypt and normalize a valid session', () => {
        const validSessionToken = sessionTestSupport.createSession({});

        const decoded = new MidburnSessionCrypto(sessionTestSupport.validKey).decrypt(validSessionToken);

        expect(Object.keys(decoded).length).to.equal(4);
        expect(decoded.email).to.be.a('string');
        expect(decoded.userName).to.be.a('string');
        expect(decoded.expiration).to.be.a('date');
        expect(decoded.created).to.be.a('date');
    });

    it('should throw an error on mismatched decoding key', () => {
        const validSessionToken = sessionTestSupport.createSession({});
        expect(() => new MidburnSessionCrypto(sessionTestSupport.invalidKey).decrypt(validSessionToken)).to.throw(Error);
    });

    it('should throw an error for invalid token', () => {
        const validSessionToken = sessionTestSupport.createSession({});
        expect(() => new MidburnSessionCrypto(sessionTestSupport.validKey).decrypt(validSessionToken.substr(2))).to.throw(Error);
    });

    it('should throw an error for expired session', () => {
        const expiredSessionToken = sessionTestSupport.createSession({ expiration: new Date(Date.now() - 60 * 1000)});
        expect(() => new MidburnSessionCrypto(sessionTestSupport.validKey).decrypt(expiredSessionToken)).to.throw(Error);
    });

    it('should throw an error for expired jwt token', () => {
        const expiredSessionToken = sessionTestSupport.createSession({ jwtExpiration: new Date(Date.now() - 60 * 1000)});
        expect(() => new MidburnSessionCrypto(sessionTestSupport.validKey).decrypt(expiredSessionToken)).to.throw(Error);
    });
});

