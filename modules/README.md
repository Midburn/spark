# Spark modules architecture and usage guide

### Module directory structure

* modules/_MODULE_NAME_/README.md - module documentation - must exist otherwise module won't be loaded
* modules/_MODULE_NAME_/libs - nodeJS server-side libraries
* modules/_MODULE_NAME_/public - front-end / static files - added automatically and available in url /modules/_MODULE_NAME_/public/...
* modules/_MODULE_NAME_/routes - expressJS routes and route tests - mounted in url /:lng?/_MODULE_NAME_/
* modules/_MODULE_NAME_/views - Jade templates - added the jade view engine list of view paths

### Integrating the module with core Spark

* modules are automatically loaded, as long as they use the above directory structure
* any npm or bower dependencies for your module should be added to the main spark package.json / bower.json files
