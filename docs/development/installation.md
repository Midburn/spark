# Installing the Spark development environment

This is a step-by-step guide to getting you up and running with Spark so you can start developing as soon as possible.

### Preconditions

* **NodeJS** ( https://nodejs.org/en/ ) (use latest version 6.9+, we use ECMAScript 2015)
* **mySQL** ( http://dev.mysql.com/downloads/mysql/ )
* **GIT** ( https://git-scm.com/downloads )

### MYSQL Preconditions

On Mac after installing, please add the following lines to your ~/.bash_profile

```
$ alias mysql=/usr/local/mysql/bin/mysql
$ alias mysqladmin=/usr/local/mysql/bin/mysqladmin
```

Also, On first install, you might get mysql password expired or other root password related issues.

To change mysql default password - run the following commands

```
mysql -u root -p
```

Enter the default root password you got during mysql setup
Then run the following to set your password:

```
SET PASSWORD = PASSWORD('xxxxxxxx');
```

### Getting the source files

* Fork the project on GitHub (this can be done in the GitHub web interface)
* clone your fork repo

```
$ git clone https://github.com/<YOUR_GITHUB_USER>/Spark.git
```

To be able to sync with Midburn repository you should add it as a remote:

```
$ git remote add midburn https://github.com/Midburn/Spark.git
```

### Installing node modules

```
$ cd spark
$ npm install
$ npm install -g nodemon knex
```

### Setting up the database

1. To create the database for the first time, run:
```
$ mysql -u root -p < sql/create_db.sql
```

2. To create the database schema:
```
$ mysql -u root -p < sql/schema.sql
$ mysql -u root -p < sql/camps.sql
```

**Note** seems knex migrations are not up to date, so should not be used at the moment, need to decide whether we are using knex or plain sql files

## Light the spark

Fire up the server after installation

`$ nodemon server.js`

and navigate to http://localhost:3000.

**Note** nodemon should take care of refreshing the server when you make changes.

### Creating an admin account

After lighting the spark, if this is the first time or if you have recreated the DB
browse to the development console at http://localhost:3000/dev and select **Create admin user**.

This will create a user: **a**, password: **a**

### Configure your environment

All the configurations are set in the config file in the `/config` folder.

To override this configurations to match your development environment:

1. Create a file named `/config/local-evelopment.json`
2. Open the file and copy all the settings you wish to override from `/config/default.json`

**Notes**:

* You only need to copy the settings you need to override, not all the settings.
* The file format should be the same as `/config/default.json`
