# Spark by Midburn

## Installation of development environment

### Preconditions
1. **NodeJS** (https://nodejs.org/en/).
2. **mySQL** (http://dev.mysql.com/downloads/mysql/)
3. **GIT** (https://git-scm.com/downloads)

### Getting the source files
Get the files using GIT clone.

### Installing node modules
Run
```
    npm install
```

### Setting up the database.
To create the database for the first time, run:
```
    mysql -u root -p < sql/create_db.sql
```
To create the database schema, run:
```
    mysql -u root -p < sql/schema.sql
```

### Configure your environment
All the configurations are set in the config file in the 
```
/config
```
folder.

To override this configurations to match your development environment:

1. Create a file named 
```
/config/local-development.json
```
2. Open the file and copy all the settings you wish to override from 
```
/config/default.json
```

**Notes**:
 
* You only need to copy the settings you need to override, not all the settings.
* The file format should be the same as 
```
/config/default.json
```
  
## Setting your IDE
The source files include a Intellij/WebStorm project. You can install the community version of IntelliJ (https://www.jetbrains.com/idea/#chooseYourEdition) for free and open the project.

It will provide you with:

* Syntax highlighting
* Code completion and navigation
* Built-in GIT interface
* Running and debugging of the server from the IDE
* Database browser and SQL shell
* and more...

### IntelliJ recommended plugins
This plugins will add syntax highlighting and IDE integration.

* .ignore 
* Jade
* Markdown Navigator
* NodeJS

## Development

### Localization (i18)

We use **i18next** for multi-language support.    

The strings are stored in 
```
/locales
```
folder. The file name is the language code.

Tips:

1. Try to make the text in Hebrew to be gender independent. If you need to separate between genders, use 
```
_male
```
 or 
```
_female
```
 suffix.
2. Use variables in the text if needed, don't concatenate texts.
3. i18next supports many string operations including formatting, single/plural forms and more. Take a look at http://i18next.com/translate/. 

To use in a JADE template:

```
// To set a HTML element with a translatable data:
HTML_ELEMENT=t('KEY')
// Example:
h1=t('welcome_spark')

// Text injection inside attributes
#{t('KEY')}
// Example:
input( data-error="#{t('bad_email')}" )
```
