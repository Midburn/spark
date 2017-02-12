# DevOps tasks and guidelines

## Manual deployment environment

This procedure can be used to manually setup and deploy to a linux server.

### Setting up the environment

* tested on Ubuntu 16.04.1 LTS (Xenial) - but should work on any Linux variant with minor changes.

```
sudo apt-get install -y jq nginx
sudo mkdir -p /opt/spark/.nvm
sudo chown -R $USER /opt/spark
curl -o- "https://raw.githubusercontent.com/creationix/nvm/v0.33.0/nvm.sh" > /opt/spark/.nvm/nvm.sh
export NVM_DIR="/opt/spark/.nvm"
source "${NVM_DIR}/nvm.sh"
echo "export NVM_DIR=/opt/spark/.nvm" >> /home/ubuntu/.bashrc
echo "source /opt/spark/.nvm/nvm.sh" >> /home/ubuntu/.bashrc
```

Create a systemd service for the spark web-app

**Note** the service will be able to start only after you do a deployment

```
echo "#!/usr/bin/env bash" > /opt/spark/start.sh
echo "export NVM_DIR=/opt/spark/.nvm" >> /opt/spark/start.sh
echo "source /opt/spark/.nvm/nvm.sh" >> /opt/spark/start.sh
echo "cd /opt/spark/latest && npm start" >> /opt/spark/start.sh
chmod +x /opt/spark/start.sh
sudo nano /etc/systemd/system/midburn-spark.service
```

Paste the following:

```
[Unit]
Description=start the Midburn Spark web app

[Service]
Type=simple
WorkingDirectory=/opt/spark/latest
ExecStart=/opt/spark/start.sh
User=ubuntu

[Install]
WantedBy=multi-user.target
```

Setup nginx as a proxy to the local web-app on port 3000

```
sudo nano /etc/nginx/sites-available/midburn-spark
```

Paste the configuration, something like this:

```
server {
    listen       80;
    server_name  54.194.247.12;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

Restart nginx

```
sudo service nginx restart
```

### Configuring the environment

Replace "..." with the actual values

```
echo 'SLACK_API_TOKEN="..."' >> /opt/spark/.env
echo 'SLACK_LOG_WEBHOOK="..."' >> /opt/spark/.env
```

Create an opsworks.js file too (it will be copied to the deployment directory)

Fill it with relevant configurations

```
nano /opt/spark/opsworks.js
```

For simple sqlite3 installation, you should create a file that will contain the database

```
touch /opt/spark/dev.sqlite3
```

Create the deploy script which will download and deploy from a package url

```
nano /opt/spark/deploy.sh
```

Paste the following:

```
#!/usr/bin/env bash

DEPLOYMENT_PACKAGE_URL="${1}"

echo "Setting up the environment..."
source /opt/spark/.nvm/nvm.sh
source /opt/spark/.env

echo "Downloading package from ${DEPLOYMENT_PACKAGE_URL}"
curl -H "Authorization: Bearer ${SLACK_API_TOKEN}" -g "${DEPLOYMENT_PACKAGE_URL}" -o- > /opt/spark/package.tar.gz

echo "Extracting..."
rm -rf /opt/spark/new
mkdir -p /opt/spark/new
pushd /opt/spark/new
    tar xzf /opt/spark/package.tar.gz
popd

echo "Copying configurations..."
cp /opt/spark/.env /opt/spark/new/.env
cp /opt/spark/opsworks.js /opt/spark/new/opsworks.js
[ -f /opt/spark/dev.sqlite3 ] && cp /opt/spark/dev.sqlite3 /opt/spark/new/dev.sqlite3

echo "Setting up the deployment directory..."
pushd /opt/spark/new
    nvm install
    nvm use
    ln -s node_modules/.bin/knex knex
    npm run deploy
    ./knex migrate:latest
popd

echo "Switching to the new deployment..."
[ -d /opt/spark/old ] && rm -rf /opt/spark/old
[ -d /opt/spark/latest ] && mv /opt/spark/latest /opt/spark/old
mv /opt/spark/new /opt/spark/latest

echo "Restarting the web app..."
sudo service midburn-spark restart
sudo service midburn-spark status
echo "DONE"
```

Make it executable

```
chmod +x /opt/spark/deploy.sh
```

### deploying a package

Run:

```
/opt/spark/deploy.sh <PACKAGE_URL>
```

### Checking server logs / debugging problems

```
sudo service midburn-spark status
sudo tail /var/log/midburn-spark.*
```

### Server add-ons

##### local SMTP server

This will setup the server for simple smtp sending directly from the instance.

**Note** For production you should use a 3rd party mail provider.

To setup postfix for local only mail sending:

```
sudo apt-get install mailutils
```

You will get a text UI for choosing options, select the following:

* configuration type: internet site
* system mail name: keep the default

```
sudo nano /etc/postfix/main.cf
```

Change inet_interfaces parameter to localhost

```
inet_interfaces = localhost
```

Restart postfix

```
sudo sevice postfix restart
```

Test the mail sending (replace user@example.com with your email):

```
echo "Hello world" | mail -s "Testing 123" user@example.com
```

If you used the default [/opsworks.js](/opsworks.js) file - it is already configured to send mail from localhost, so no change is required.

##### local Mysql server

This will setup a local mysql server (MariaDB)

```
sudo apt-get install -y mariadb-server
```

first, put the spark user password in a variable (but without writing it so it won't be saved in history)

```
read SPARK_DB_PASSWORD
```

Create a spark user accessible from localhost only and the spark DB

```
echo "CREATE USER 'spark'@'localhost' IDENTIFIED BY '${SPARK_DB_PASSWORD}'" | sudo mysql
echo "CREATE DATABASE spark CHARACTER SET = 'utf8' COLLATE = 'utf8_general_ci';" | sudo mysql
echo "GRANT ALL ON spark.* TO 'spark'@'localhost';" | sudo mysql
```

You can test if it works

```
mysql -h localhost -u spark -p spark
```

Modify the spark configuration

```
nano /opt/spark/opsworks.js
```

Remove the sqlite configuration and uncomment the mysql configuration.

It should look something like this:

```
exports.db = {
    "client"        : "mysql",
    "debug"         : false,
    "host"          : "localhost",
    "database"      : "spark",
    "user"          : "spark",
    "password"      : "... the password ...",
    "charset"       : "utf8",
};
```

Run migrations (assuming you have a deployment installed)

```
cd /opt/spark/latest
./knex migrate:latest
sudo service midburn-spark restart
```

##### Setting up for automatic deployment

We will use an ssh key limited for specific command, only for deployment. This allows to easily and securely deploy from CI system (e.g. travis)

Generate the key and set it in authorized_keys limited to deploy command only:

```
ssh-keygen -t rsa -b 4096 -C "spark-deployment" -f /opt/spark/spark_deployment.id_rsa
echo "command="/opt/spark/deploy.sh $SSH_ORIGINAL_COMMAND" `cat /opt/spark/spark-deployment.id_rsa.pub`" >> ~/.ssh/authorized_keys
```

Now, to deploy you can run something like this:

```
ssh -i ~/spark-deployment.id_rsa ubuntu@server 'PACKAGE_URL'
```

#### production environment

For production environment you should make the following changes:
* add NODE_ENV=production to the /opt/spark/.env file
* source the .env file by adding the line "source /opt/spark/.env" to the following:
  * ~/.bashrc
  * /opt/spark/start.sh
* allow external services (e.g. travis) to notify production server about named releases
  * this allows travis to let the server know there is a release ready and what is the URL but doesn't actually deploy it
  * `mkdir -p /opt/spark/releases`
  * `nano /opt/spark/release-notify.sh`
    * `#!/usr/bin/env bash`
    * `echo "${2}" > "/opt/spark/releases/${1}"`
  * `nano /opt/spark/deploy.sh`
    * modify only the first line - to get package url from the named releases:
    * ```DEPLOYMENT_PACKAGE_URL=`cat "/opt/spark/releases/${1}"````
  * you can test it by specifying a named releases and then deploying it:
    * (replace PACKAGE_URL with an actual package url)
    * `/opt/spark/release-notify.sh v1.test PACKAGE_URL`
    * `/opt/spark/deploy.sh v1.test`
  * setup an ssh key for the release notifications:
    * `ssh-keygen -t rsa -b 4096 -C "spark-release-notify" -f /opt/spark/spark_release_notify.id_rsa`
    * ```echo "command=\"/opt/spark/release-notify.sh $SSH_ORIGINAL_COMMAND\" `cat /opt/spark/spark_release_notify.id_rsa.pub`" >> ~/.ssh/authorized_keys```
  * test it
    * `ssh -i ~/spark_release_notify.id_rsa ubuntu@server 'RELEASE_NAME' 'PACKAGE_URL'`
    * `ssh -i ~/spark_deployment.id_rsa ubuntu@server 'RELEASE_NAME'`
  * add variables in travis settings:
    * SPARK_RELEASE_NOTIFICATION_KEY - the private key for release notification
    * SPARK_RELEASE_NOTIFICATION_HOST - the host of the production instance
  * publish a release in GitHub and then try to deploy it
    * `ssh -i ~/spark_deployment.id_rsa ubuntu@server 'RELEASE_NAME'`
* setup slack slash-command integration
  * create directory /opt/spark/slack
  * `npm init`
  * `npm install --save express body-parser`
  * `nano /opt/spark/slack/index.js`
```
var express = require('express')
var bodyParser = require("body-parser");
var fs = require('fs');
var child_process = require('child_process');

var app = express()
app.use(bodyParser.urlencoded({extended:false}));

var _isValidToken = function(token) {
    return (process.env.SLACK_DEPLOY_TOKEN && token && token === process.env.SLACK_DEPLOY_TOKEN);
}

var _isUserAllowedToDeployed = function(user_name) {
    return (process.env.SLACK_DEPLOY_ALLOWED_USERS && user_name && process.env.SLACK_DEPLOY_ALLOWED_USERS.split(',').indexOf(user_name) > -1);
}

app.post('/deploy', function (req, res) {
    if (!_isValidToken(req.body.token)) {
        res.status(500).send('invalid token');
    } else if (!_isUserAllowedToDeployed(req.body.user_name)) {
        res.status(500).send('user is not allowed to deploy');
    } else if (!req.body.text || !fs.existsSync("/opt/spark/releases/"+req.body.text)) {
        res.status(500).send('server was not notified about this release name, please ensure it is correct and/or check relevant travis build log');
    } else {
        res.json({
            "response_type": "in_channel",
            "text":"Deploying Spark "+req.body.text+" to production, please wait..."
        });
        var output = child_process.execSync("/opt/spark/deploy.sh "+req.body.text+" "+req.body.response_url);
        console.log(output.toString());
    }
})

app.listen(3100, function () {
  console.log('Spark-slack listening on port 3100')
})
```
  * `nano /opt/spark/slack/package.json`
    * modify the start script to this:
    * `"start": "bash -c 'source ../.env && node index.js'"`
  * add the following to /opt/spark/.env file:
    * SLACK_DEPLOY_TOKEN
    * SLACK_DEPLOY_ALLOWED_USERS
  * `nano /opt/spark/start-slack.sh`
```
#!/usr/bin/env bash
export NVM_DIR=/opt/spark/.nvm
source /opt/spark/.nvm/nvm.sh
source /opt/spark/.env
cd /opt/spark/slack && npm start
```
  * `sudo nano /etc/systemd/system/midburn-spark-slack.service`
```
[Unit]
Description=start the Midburn Spark web app

[Service]
Type=simple
WorkingDirectory=/opt/spark/latest
ExecStart=/opt/spark/start.sh
User=ubuntu

[Install]
WantedBy=multi-user.target
```
  * start the service: `sudo service midburn-spark-slack start`
