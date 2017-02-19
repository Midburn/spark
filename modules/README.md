# Spark modules architecture and usage guide

## Overview

All Spark modules are under modules directory.

### Module directory structure and files description

* modules
    * module_name
        * README.md - module documentation - must exist otherwise module won't be loaded
        * routes.js - module routes
        * routes.test.js - module routes test
            * (any file ending with test.js will run as part of the test suite)
    * libs/ - server-side libraries
        * can be required using `modules.require('module_name', 'libs/libsname');`
        * this can be used to provide cross-module dependencies
    * public/ - frontend / static files
        * exposed automatically (if directory exists) and available in url /modules/module_name/public/...
    * views - jade templates
        * included automatically as part of the template engine view paths
        * if for example you have a template under `modules/module_name/views/module/example.jade`
        * it will be available under view path `module/example.jade`
    * api - provide api methods to be included in the [Spark API](/modules/api/README.md)
