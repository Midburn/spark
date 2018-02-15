#!/usr/bin/python

import hashlib, sys

# Simplified version of https://github.com/drupal/drupal/blob/7.x/includes/password.inc

ALGO = hashlib.sha512

ITOA64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' # ICHS

def dummy_base64(s, l):
    output = ''
    i = 0
    while True:
        v = ord(s[i])
        i+=1
        output += ITOA64[v & 0x3f]
        if i < (l-1):
            v |= ord(s[i]) << 8
        output += ITOA64[(v>>6) & 0x3f]
        if (i + 1) >= l:
            break
        i += 1
        if not (i < l):
            break
        if i < (l-1):
            v  |= ord(s[i]) << 16
        output += ITOA64[(v >> 12) & 0x3f];
        i += 1
        if not (i < l):
            break
        output += ITOA64[(v >> 18) & 0x3f]
    return output

def hash_password(password, salt, iterations):
    res = ALGO(salt + password).digest()
    for i in xrange(1<<iterations):
        res = ALGO(res + password).digest()
    return dummy_base64(res, len(res))[:43]

def parse_entry(h):
    assert(h[:3] == '$S$')
    iterations = ITOA64.index(h[3])
    salt = h[4:12]
    return {
            'iterations': iterations,
            'salt': salt,
            'hash': h[12:]
            }

def equal_to_password(hashed_entry, password):
    entry = parse_entry(hashed_entry)
    result = hash_password(password, entry['salt'], entry['iterations'])
    return result == entry['hash']

def test(h):
    password = raw_input("Password to check? ")
    try:
        if not equal_to_password(h, password):
            print("Oh no, we failed")
        else:
            print("Yey! win")
    except Exception, e:
        print("Oh no, we failed")

def main(hashs):
    [test(h) for h in hashs]

if __name__ == '__main__':
    if len(sys.argv) == 1:
        print("Usage: %s hash-1 hash-2 ..." % (sys.argv[0],))
    else:
        main(sys.argv[1:])
