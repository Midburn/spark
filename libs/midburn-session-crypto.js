const jwtCrypto = require('./security-token');
const assert = require('assert');
const _ = require('lodash');

class MidburnSessionCrypto {
    constructor(pubKey) {
        assert(pubKey, 'pubKey is mandatory');
        this.opts = {publicKey: this.normalizeKey(pubKey)};
        const identity = el => el;
        const parseDate = el => new Date(el);
        this.fieldTransforms = {
            email: {key: 'email', fn: identity},
            userName: {key: 'userName', fn: identity},
            exp: {key: 'expiration', fn: parseDate},
            cd: {key: 'created', fn: parseDate}
        };
    }

    decrypt(token) {
        try {
            const decoded = JSON.parse(jwtCrypto.decrypt(token.substring(4), this.opts).data);
            const normalized = this.stripAndNormalize(decoded);
            this.assertExpired(normalized.expiration);
            return normalized;
        } catch (e) {
            if (e.name === 'TokenExpiredError') {
                throw new /*SessionExpired*/Error('token expired', e.expiredAt);
            } else {
                throw new /*SessionMalformed*/Error(e.message);
            }
        }
    }

    // private
    assertExpired(toCheck) {
        if (Date.now() > toCheck.getTime()) {
            throw new /*SessionExpired*/Error('expiration date: ' + toCheck);
        }
    }

    stripAndNormalize(sessionObject) {
        const transformed = {};
        Object.keys(this.fieldTransforms)
              .forEach(key => {
                  if (!_.isUndefined(sessionObject[key])) {
                      const transformer = this.fieldTransforms[key];
                      transformed[transformer.key] = transformer.fn(sessionObject[key]);
                  }
              });
        return transformed;
    }

    normalizeKey(key) {
        if (key.startsWith('-----BEGIN')) {
            return key;
        } else {
            return `-----BEGIN PUBLIC KEY-----\n${key.match(/.{1,65}/g).join('\n')}\n-----END PUBLIC KEY-----\n`
        }
    }
}

module.exports = MidburnSessionCrypto;
