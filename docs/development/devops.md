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

Create a .env file in /opt/spark/.env based on [/.env-example](/.env-example)


Replace "..." with the actual values

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
nano /opt/spark/.env
```

Remove the sqlite configuration and uncomment the mysql configuration.

It should look something like this:

```
SPARK_DB_CLIENT=mysql
SPARK_DB_HOSTNAME=localhost
SPARK_DB_DBNAME=spark
SPARK_DB_USER=spark
SPARK_DB_PASSWORD=YOUR_PASSWORD
SPARK_DB_DEBUG=false
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

