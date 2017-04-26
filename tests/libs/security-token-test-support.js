const NodeRSA = require('node-rsa');

const data = {token: 'data-token'};
const encryptionKeys = keyPair();
const anotherEncryptionKeys = keyPair();

function keyPair() {
    const key = new NodeRSA({b: 512});
    return {
        private: key.exportKey('private'),
        public: key.exportKey('public')
    };
}

module.exports = {data, encryptionKeys, anotherEncryptionKeys};

