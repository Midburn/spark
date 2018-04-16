# Installing the Spark development environment

This is a step-by-step guide to getting you up and running with Spark so you can start developing as soon as possible.

### Preconditions

* **NodeJS** ( https://nodejs.org/en/ ) (use latest version 8, we use ECMAScript 2015)
* **MySQL** ( https://dev.mysql.com/downloads/mysql/ )
* **GIT** ( https://git-scm.com/downloads )

Download and install as described on the websites.

### Getting the source files

* Fork the project on GitHub (this can be done in the GitHub web interface)
* clone your forked repo

```shell
git clone https://github.com/<YOUR_GITHUB_USER>/Spark.git
```
Enter into the new Repository Folder

```shell
cd Spark
```

```shell
git remote add midburn https://github.com/Midburn/Spark.git
```

To be able to sync with Midburn repository you should add it as a remote:

```shell
git pull midburn master
```

### Getting Node and Yarn

We use latest Node version 8, you can install it manually https://nodejs.org/en/ or using [nvm](https://github.com/creationix/nvm#installation)

If you use nvm you can run the following from project directory to get the right node version:

```shell
nvm install
nvm use
```

We use [Yarn](https://yarnpkg.com/en/) to install dependencies, make sure you have the latest Yarn version

This command will install the latest yarn on Linux:

```
curl -o- -L https://yarnpkg.com/install.sh | bash
```

### Installing dependencies

```shell
yarn 
```
this will install client dependencies as well.
(If you have problems, make sure you delete the `node_moduels` directories first)

### Setting up the database

Hint: it can be much easier to use the docker-compose environment to get a DB prepopulated with data, see [using spark with docker](/docs/development/docker.md) for more details.

Local development environment uses MySQL by default.

try 
```shell
npm run newDevDB
```
which should create the DB, create a spark user, migrate to latest, and run initial seed.
if you have a password on you'r MySQL root user, than go to package.json "createdb" and add "-p" after root. this is promet you to enter password (please remove the "-p" before pushing to git)


it the above doesn't work, trying follwing these step-by-step guide:
Create the spark MySQL DB
```shell
npm run-script createdb
```

We use Knex to run and manage the migrations.  
run Knex to initialize the DB tables structure.

```shell
knex migrate:latest
```

Create a new user.  
by defulat spark connectes to MySql with user 'spark' and password 'spark',  
set the a spark MySQL user (unless you are creating a local '/config.env' file)

Connect to MySql
```shell
mysql -u root -p
```
Create a new MySql user with all privileges to spark DB.
```shell
CREATE USER 'spark'@'localhost' IDENTIFIED BY 'spark';
```
If this fails, you might want to
```shell```
delete from mysql.db where user = 'spark';
FLUSH PRIVILEGES;
```
and then - 
```shell
GRANT ALL PRIVILEGES ON spark . * TO 'spark'@'localhost';
```

See [/docs/database.md](/docs/development/database.md) for more details about our database setup.

## Light the spark

Fire up the server after installation, with `nodemon` to monitor changes and re-run the server:

```shell
yarn run nodemon
```
or node server.js - no auto refresh.

And then,
Fire up the browser after installation, with `browser-snyc` to refresh on changes (at 'public' 'view' 'locals' folders):
```shell
yarn run hot 
```
or navigate to [http://localhost:3000](http://localhost:3000) - no auto refresh.

**Note** nodemon should take care of refreshing the server when you make changes.

### Creating an admin account

After lighting the spark, if this is the first time or if you have recreated the DB
browse to the development console at [http://localhost:3000/dev](http://localhost:3000/dev) and select **Create admin user**.

This will create a user: **a**, password: **a**

### Configure your environment

All the configurations are set in the config file in the `/config` folder.

To override this configurations to match your development environment:

1. Create a file named `/config/local-evelopment.json`
2. Open the file and copy all the settings you wish to override from `/config/default.json`

**Notes**:

* You only need to copy the settings you need to override, not all the settings.
* The file format should be the same as `/config/default.json`
