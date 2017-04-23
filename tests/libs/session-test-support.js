const chance = require('chance')();
const jwtCrypto = require('../../libs/security-token');

const mismatchedPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3vS2nXhT51M1ldmT2orI
jbxYP36Mh0PAMuvRdVffZ1gKalKE6FZxKaILflKrUGXCq24HJDHWRxduF0nIk2JI
g3O9kD8pQGmdo9G7QLApFoXIWidhYjAcx5A9ASM9MLsECwBbUcXwhkFgDMCcjVRw
VJPtX/U5fkUEwGME9VSG8UJvYZTiwAqJIU1ko/UT7QT2ho7f172TCckDuqcFc6LO
WJ/ZC6XeUuQa1M5vqs/7uhsHLGuVd1B+RBc6lbozDV0eJOhqgzKZvjm13jRsyjZY
p1yTlwbJyJ39A5PMFYtRl8SasC6yIvSihHwGTCrgTYeOdDaVOSNp8J5fz6L/qiK0
8wIDAQAB
-----END PUBLIC KEY-----`;

const devKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApbgo7FKL3xjgA+Yq3RQ
gXKA8yWGsgKQI6xUDZ2tDekiMr5PypTGedJSUzkqc3dD472MLPZJoWPzxtVfJuz
YDlXXTyyG7Gs+wW2rLJXSJHqKc6tPV4PNB3dIVxvztmOIZWa4v8cbYLQ7jO+vT7
jBOM1iByVvrwI7gjmSJh58vWLCIy4cZOwfA4F12kQpl+s3/G4dgYjuhf6htjmXB
W2M+x0mKBLeW4U7YFKsdYsEzTFHj8u0q4+uFKjNwCDzYl5yWW+ddo721cro5kbf
H2HfVj0bmTFiP4sE2B0Bpcy7T92k7k2hlUSu339yl9NwWukqpRfKG9FoOmeZTEw
z+L/zJCwIDAQAB
-----END PUBLIC KEY-----
`;

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCluCjsUovfGOA
D5irdFCBcoDzJYayApAjrFQNna0N6SIyvk/KlMZ50lJTOSpzd0PjvYws9kmhY/P
G1V8m7NgOVddPLIbsaz7BbassldIkeopzq09Xg80Hd0hXG/O2Y4hlZri/xxtgtD
uM769PuME4zWIHJW+vAjuCOZImHny9YsIjLhxk7B8DgXXaRCmX6zf8bh2BiO6F/
qG2OZcFbYz7HSYoEt5bhTtgUqx1iwTNMUePy7Srj64UqM3AIPNiXnJZb512jvbV
yujmRt8fYd9WPRuZMWI/iwTYHQGlzLtP3aTuTaGVRK7ff3KX03Ba6SqlF8ob0Wg
6Z5lMTDP4v/MkLAgMBAAECggEABSVRx/zMMRJBqn1UKWc9lgK3wH0S8S+mwz30z
BpNjxd/ntgWOcDvrakLcdhpRI3/nNdTewb3zIOWMc5XCkQkGlj9SZpzh+KZFE2d
nz0eIOBlxPjs9D45dlzWpkYmTo/+v4UkIfrNraB/t9Wb0BKZ6wg9h3YePO1y1Zk
TmC1+N9++pA6NZ2thlbYg1+THOSnsLVdpV7ZA+4GfqEmGLALyxpNgV0yqLCK5xI
6+G7TpQfTAxs8pO4VHFQNsA5iKHQM8B3OCjRsTRF2Mwjope7U41HrTeJR/joJgh
LpueGiKTiQq76gWfpMpucZ5wFKtWeJ8WYACUsfJlzW02i+VdWP3yQKBgQDTGdoP
sWFgoCCTTmwx5p5BNwwO61l+7N8Yd6djf4p+Xw8N/+mGMwRdBwQMVFKkOvaERd1
jsgc17i+9ghY6XaO63Cy8gniXPHYfWBWgGeMM7fPBr+Pa8ZqouSUoihRS4IsbuZ
+0iMghev0VcTS1fGMQ2zbgS0Qo0rWNHkFFi9rufwKBgQDI91gQtjWo82k5jiULd
AbQejvUZ7ZlRtqL0om5n9NeeE/BP62Mvke5qlVW8Z8fH7JVipnGGk2nIYiJgu+u
QltaN7RW1NTb3FfWUmz6mWHEhC7LHghAU2hXUwTWILSEhqSf74tIKSvSJ/YkWla
IS2K5ACL0Lcn+j4zZmCc4tQ+3dQKBgQDDuTVX1XNenjh1u4FPJu5Vss8ISic5Ki
+SxOW6t7bVghc4OKzwkv6ZrfaP4+KXiF+ltg0U8SwEUamLwEARr14t0xPbV/Cs8
A7o8sdiIH5GL50QWJ8fEWD+zGJqWtOLH8t6UjmDrko32IssRUDEf+Zt64HOpZo1
a1+Ozp1f+NJsywKBgCZvV8JqdrzHQNqnGuKj4CHDHuoyo6me8XFIZNrBfHVW4Tn
+aby/L4yMzSGBuIMFVuART/OZWDycpzZVem2Dd2E7whvRPJyH+ayduwX6i74/4Y
srRTy4Nv5sfEJPovatoZKNB8BXT3A0AFlXhbEvacQkCItWrokm/zMmbGnmBwl5A
oGBAK+CHeC1D+D+uQgmhFF4SHZZ7T8TMihtmHCzf5tUWByKozD7OE9hrW0Pxw/o
SidmVgVV/O9cyrjvwH0h6uezaeA98sVuqpomlcKqax/MBNASmsl4Vs7ouu5yjPY
3SviV1nK3G3SYiz/va02PnAmXqf1W2u7bjoIAbZCrueKWr8OO
-----END PRIVATE KEY-----
`;

function encryptAsMidburnSession(session, privateKey, jwtExpiration) {
    const exp = (jwtExpiration ? jwtExpiration.getTime() : Date.now() + 60 * 1000) / 1000;
    return 'JWT.' + jwtCrypto.encrypt({exp, data: JSON.stringify(session)}, {privateKey});
}

function aMidburnSession(overrides) {
    return Object.assign({}, {
        email: chance.word(),
        userName: chance.word(),
        cd: chance.date(),
        exp: chance.date()
    }, overrides);
}

const createSession = (opts) => {
    const sessionData = aMidburnSession({exp: opts.expiration || new Date(Date.now() + 60*60*24*1000)});
    return encryptAsMidburnSession(sessionData, privateKey, opts.jwtExpiration);
};

module.exports = {
    createSession: createSession,
    privateKey: privateKey,
    validKey: devKey,
    validKeyInInvalidFormat: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApbgo7FKL3xjgA+Yq3RQgXKA8yWGsgKQI6xUDZ2tDekiMr5PypTGedJSUzkqc3dD472MLPZJoWPzxtVfJuzYDlXXTyyG7Gs+wW2rLJXSJHqKc6tPV4PNB3dIVxvztmOIZWa4v8cbYLQ7jO+vT7jBOM1iByVvrwI7gjmSJh58vWLCIy4cZOwfA4F12kQpl+s3/G4dgYjuhf6htjmXBW2M+x0mKBLeW4U7YFKsdYsEzTFHj8u0q4+uFKjNwCDzYl5yWW+ddo721cro5kbfH2HfVj0bmTFiP4sE2B0Bpcy7T92k7k2hlUSu339yl9NwWukqpRfKG9FoOmeZTEwz+L/zJCwIDAQAB',
    invalidKey: mismatchedPublicKey
}
