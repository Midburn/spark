const jwt = require('jsonwebtoken');
const assert = require('assert');

const Algo = 'RS256';

const encrypt = (data, opts) => {
    assert(opts, 'options.privateKey is mandatory');
    assert(opts.privateKey, 'options.privateKey is mandatory');

    return jwt.sign(data, opts.privateKey, {algorithm: Algo});
};

const decrypt = (data, opts) => {
    assert(opts, 'options.publicKey is mandatory');
    assert(opts.publicKey, 'options.publicKey is mandatory');

    return jwt.verify(data, opts.publicKey, {
        algorithms: [Algo],
        ignoreExpiration: opts.ignoreExpiration || false
    });
};

module.exports = {encrypt, decrypt};
