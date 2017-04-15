#!/usr/bin/env bash

nvm install
nvm use
curl -o- -L https://yarnpkg.com/install.sh | bash
export PATH="$HOME/.yarn/bin:$PATH"
yarn add bower sqlite3
./node_modules/.bin/bower install
