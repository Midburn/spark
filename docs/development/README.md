# Spark development

Documentation hub for Spark development.

**Note** This document is intended for people interested in helping the Spark development effort.
If you just want to use Spark or integrate it with your system, refer to the [Spark usage guide](/docs/usage/README.md).

## TL;DR / Quickstart

* [Install the Spark development environment](/docs/development/installation.md)

If you want to update the documentation, have a look here:

* [Spark documentation development](/docs/development/documentation.md)

If you want to contribute code you should review the following documents as well:

* [Branching, patching and merging](/docs/development/branching.md)
* [Contribution guidelines](/CONTRIBUTING.md)

Additional documents:

* [database - installation / setup / usage notes](/docs/development/database.md)
* [Setting your IDE for Spark development](/docs/development/IDE.md)
* [Spark architecture](/docs/development/architecture.md)
* [Releases and deployment](/docs/development/releases-and-deployment.md)
* [Users roles and permissions](/docs/development/users-roles-and-permissions.md)
* [Drupal Profiles syetm](/docs/development/profile-system.md)
## Localization
We use the **i18next** internationalization library for multi-language support.
The strings are stored in the `/locales` folder. The file name is the language code.

###### Tips:

1. Try to make the Hebrew text gender neutral. If you need to differentiate between genders, use the `_male` or `_female` suffixes.
2. Use variables in the text if needed, don't concatenate strings.
3. i18next supports many string operations including formatting, single/plural forms and more. Take a look at [i18next documentation](http://i18next.com/translate/).

## Templates

We use Jade template engine, a language that compiles to HTML, to seperate logic from markup. No more angle brackets!

Read more about [Jade Syntax Documentation](http://naltatis.github.io/jade-syntax-docs/)

Greate Jade to HTML converter [Here](http://aramboyajyan.github.io/online-jade-template-editor/)

## i18n & templates

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

## Email

Spark emails by default are **not being sent**. If you wish the emails from Spark to go through, set the `enable` property in your **local** config file.

```javascript
  "mail": {
	"enabled": true,
  },
```
