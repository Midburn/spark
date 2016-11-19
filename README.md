
# Spark by Midburn

## Table of contents

[TOC]

## Installation

### Preconditions
>1. **NodeJS** (https://nodejs.org/en/ )
>2. **mySQL** (http://dev.mysql.com/downloads/mysql/ )
>3. **GIT** (https://git-scm.com/downloads )

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
make dir & clone the repo
```
$ mkdir spark && git clone http://<USER_NAME>@jira.midburn.org:7990/scm/spark/spark.git
```

**OR** (For GUEST access)
```
$ mkdir spark && git clone http://jira.midburn.org:7990/scm/spark/spark.git
```

### Installing node modules
`$ cd spark && npm install`

### Setting up the database
1. To create the database for the first time, run:
```
$ mysql -u root -p < sql/create_db.sql
```

2. To create the database schema, run:
```
$ mysql -u root -p < sql/schema.sql
```

## Light the spark
Fire up the server after installation

`$ node server.js`

and navigate to [http://localhost:3000](http://localhost:3000)

### Activate your account
after registration, log into mysql

`$ mysql -u root -p`

switch database to spark:

`mysql>use spark;`

update **validated** attribute on your account:

`UPDATE users SET validated=1 WHERE email = '<EMAIL>';`

### Configure your environment
All the configurations are set in the config file in the `/config` folder.

To override this configurations to match your development environment:

1. Create a file named `/config/local-evelopment.json`
2. Open the file and copy all the settings you wish to override from `/config/default.json`

**Notes**:

* You only need to copy the settings you need to override, not all the settings.
* The file format should be the same as `/config/default.json`


## Development

### Architecture

![Spark System Architecture](http://i.imgur.com/LvTNs3q.png)


### Setting your IDE
The source files include an Intellij/WebStorm project file. You can install get the [community version of IntelliJ](https://www.jetbrains.com/idea/#chooseYourEdition) for free and open the project.

It will provide you with:

* Syntax highlighting
* Code completion and navigation
* Built-in GIT interface
* Running and debugging of the server from the IDE
* Database browser and SQL shell
* and more...

#### IntelliJ recommended plugins
This plugins will add syntax highlighting and IDE integration.

* .ignore
* Jade
* Markdown Navigator
* NodeJS

### Branching and patching
while working on new features/patch you should branch out master using
```
$ git checkout -b <BRANCH_NAME>
```
It is recommended that your `<BRANCH_NAME>` will start with your name and short description of the your changes. For example example: `nate_updating_readme_file`

after writing some awesome code on your new shiny branch, you should `commit` changes and `merge` with origin/master, to do that use:

```
$ git commit -am "<COMMIT_MSG>"
$ git checkout master && git pull origin master
$ git checkout <YOUR_BRANCH_NAME> && git push origin <YOUR_BRANCH_NAME>
```

Note:

1. To push your branch you will need to first [create an account on JIRA](http://jira.midburn.org:7990/signup).
2. Push your branch via the above snippet
3. [Send a pull request](http://jira.midburn.org:7990/projects/SPARK/repos/spark/pull-requests).


Further reading about git [here](http://rogerdudler.github.io/git-guide/)

### Localization
We use the **i18next** internationalization library for multi-language support. 
The strings are stored in the `/locales` folder. The file name is the language code.

####Tips:

1. Try to make the Hebrew text gender neutral. If you need to differentiate between genders, use the `_male` or `_female` suffixes.
2. Use variables in the text if needed, don't concatenate strings.
3. i18next supports many string operations including formatting, single/plural forms and more. Take a look at [i18next documentation](http://i18next.com/translate/).

### Templates
We use Jade template engine, a language that compiles to HTML, to seperate logic from markup. No more angle brackets!

Read more about [Jade Syntax Documentation](http://naltatis.github.io/jade-syntax-docs/)

Greate Jade to HTML converter [Here](http://aramboyajyan.github.io/online-jade-template-editor/)

#### i18n & templates
You can use i18n in Jade templates. To set an HTML element with a translatable data the general syntax is:
```
HTML_ELEMENT=t('KEY')
```
Example:
```
h1=t('welcome_spark')
```
Text injection inside attributes:
```
#{t('KEY')}
```
Example:
```
input( data-error="#{t('bad_email')}" )
```

### Email
Spark emails by default are **not being sent**. If you wish the emails from Spark to go through, set the `enable` property in your **local** config file.

```javascript
  "mail": {
	"enabled": true,
  },
```

###README
To edit this readme file, get acquainted with the [Markdown Syntax](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet).
To help you preview and edit the readme file you can use an [online editor](https://stackedit.io) or any [browser extensions](https://chrome.google.com/webstore/detail/markdown-preview/jmchmkecamhbiokiopfpnfgbidieafmd).