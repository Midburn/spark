#!/usr/bin/env bash

nvm install
nvm use
curl -o- -L https://yarnpkg.com/install.sh | bash
export PATH="$HOME/.yarn/bin:$PATH"
yarn add bower
./node_modules/.bin/bower install
