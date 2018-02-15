#!/usr/bin/env bash

# installing system dependencies
apt-get install -y jq

# nvm - node version manager
mkdir -p /opt/spark/.nvm
curl -o- "https://raw.githubusercontent.com/creationix/nvm/v0.33.0/nvm.sh" > /opt/spark/.nvm/nvm.sh
export NVM_DIR="/opt/spark/.nvm"
source "${NVM_DIR}/nvm.sh"

PACKAGE_FILE="/opt/spark/package.tar.gz"
rm -f "${PACKAGE_FILE}"

# build the deployment package
pushd /opt/spark-source
    nvm install
    nvm use
    npm install
    npm run build --file="${PACKAGE_FILE}"
popd

# deploy the package
rm -rf /opt/spark/deployment
mkdir -p /opt/spark/deployment
pushd /opt/spark/deployment
    tar -xzf "${PACKAGE_FILE}"
    nvm install
    nvm use

    # setup configuration files
    cp /opt/spark-source/vagrant/vagrant.env .env

    # prepare the deployment directory
    npm run deploy
popd

# make everything owned by ubuntu user - which is the login user when doing vagrant ssh
sudo chown -R ubuntu:ubuntu /opt/spark

# setup correct node on ubuntu user login
echo "sudo chown -R ubuntu:ubuntu /opt/spark" >> /home/ubuntu/bashrc
echo "export NVM_DIR=/opt/spark/.nvm" >> /home/ubuntu/.bashrc
echo "source /opt/spark/.nvm/nvm.sh" >> /home/ubuntu/.bashrc
