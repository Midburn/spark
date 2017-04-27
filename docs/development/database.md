# Spark database

The Spark project uses 
* **MyQSL** ( https://dev.mysql.com/downloads/mysql/ ) as the default database engine.
* **Knex.js** ( http://knexjs.org/ ) to manage database connection and migrations.

### Using MySql

By default we use MySql. Other database are currently not supported.

#### MySql installation

##### Windows
Download MySQL Community Server from [MyQSL website](https://dev.mysql.com/downloads/mysql/). On the installation wizard, it is recommended to select custom install and include MySQL Server only. Choosing a full install will install tons of development tools that are not mandatory.

##### Mac

On Mac after installing, please add the following lines to your ~/.bash_profile
```shell
alias mysql=/usr/local/mysql/bin/mysql
alias mysqladmin=/usr/local/mysql/bin/mysqladmin
```

##### Overcoming root password problems
Also, On first install, you might get mysql password expired or other root password related issues.

To change mysql default password - run the following commands
```shell
mysql -u root -p
```
Enter the default root password you got during mysql setup
Then run the following to set your password:
```
SET PASSWORD = PASSWORD('xxxxxxxx');
```

#### MySql configuration in Spark project

If you are **not** using a simple local server configuration, edit your .env file and set the relevant settings to match your database (If you don't have an .env file, duplicate .env-example).

```
SPARK_DB_CLIENT=mysql
SPARK_DB_HOSTNAME=localhost
SPARK_DB_DBNAME=spark
SPARK_DB_USER=spark
SPARK_DB_PASSWORD=spark
SPARK_DB_DEBUG=false
```

To create the Spark database and the user, run:

```
npm run-script createdb
```

or if you need to use different credentials, use a command similar to: 

```shell
sudo mysql -u root < migrations/create_db.sql
```
### Database configuration

Knex uses the database configuration from the [.env](/.env-example) file.

By default (local dev machine) it is configured to use MySQL.

### Running migrations

Make sure you have Knex installed:

```shell
npm install -g knex
```

Migrate forward to latest migration

```shell
knex migrate:latest
```

See [Knex.js documentation](http://knexjs.org/#Migrations-CLI) for more options and details

### Creating a new migration

Run migrate:make with a relevant migration name:

```shell
knex migrate:make <migration_name>
```

Edit the created file and write your migration.

You can see the other migration files for examples or refer to the [Knex.js documentation](http://knexjs.org/#Schema)

