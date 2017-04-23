const securityToken = require('../../libs/security-token');
const NodeRSA = require('node-rsa');
const expect = require('chai').expect;
const securityTokenTestSupport = require('./security-token-test-support');

const encryptionKeys = securityTokenTestSupport.encryptionKeys;
const anotherEncryptionKeys = securityTokenTestSupport.anotherEncryptionKeys;

describe('jwt-crypto', () => {

    it('should encrypt/decrypt a token', () => {
        const data = {token: 'data-token'};

        const encrypted = securityToken.encrypt(data, {privateKey: encryptionKeys.private});

        expect(securityToken.decrypt(encrypted, {publicKey: encryptionKeys.public})).to.be.deep.property('token', 'data-token');
    });

    it('should fail to decrypt with non-matching keys', () => {
        const data = {token: 'data-token'};

        const encrypted = securityToken.encrypt(data, {privateKey: encryptionKeys.private});

        expect(() => securityToken.decrypt(encrypted, {publicKey: anotherEncryptionKeys.public})).to.throw(Error);
    });

    describe('decrypt', () => {
        it('should fail if options is not provided', () => {
            expect(() => securityToken.decrypt('data')).to.throw('options.publicKey is mandatory');
        });

        it('should fail if options.publicKey is not provided', () => {
            expect(() => securityToken.decrypt('data', {})).to.throw('options.publicKey is mandatory');
        });

        it('should not validate expiration given "ignoreExpiration" is set', () => {
            const minus30Sec = Math.floor(Date.now() / 1000) - 30;
            const data = {token: 'data-token', iat: minus30Sec, exp: 10};

            const encrypted = securityToken.encrypt(data, {privateKey: encryptionKeys.private});

            expect(() => securityToken.decrypt(encrypted, {publicKey: encryptionKeys.public, ignoreExpiration: true})).to.not.throw(Error);
        });

        it('should validate expiration by default', () => {
            const minus30Sec = Math.floor(Date.now() / 1000) - 30;
            const data = {token: 'data-token', iat: minus30Sec, exp: 10};

            const encrypted = securityToken.encrypt(data, {privateKey: encryptionKeys.private});

            expect(() => securityToken.decrypt(encrypted, {publicKey: encryptionKeys.public})).to.throw(Error);
        });
    });

    describe('encrypt', () => {
        it('should fail if options is not provided', () => {
            expect(() => securityToken.encrypt('data')).to.throw('options.privateKey is mandatory');
        });

        it('should fail if options.publicKey is not provided', () => {
            expect(() => securityToken.encrypt('data', {})).to.throw('options.privateKey is mandatory');
        });
    });
});
