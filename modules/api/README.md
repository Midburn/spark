### Spark API

Provides publically accessible authenticated REST APIs

#### Introduction

We would like to have as much logic as possible available via the Spark HTTP rest API.

This can allow 3rd parties to integrate with Spark and use it directly from the front-end.

Spark will provide users / authentication / permissions services as well as access to the different Spark modules.

#### Using the API

All API methods are available for both internal and external use

* Internal use - via the JS libs - from other Spark modules / code
* External use - via the REST API - from any authenticated 3rd party

#### Internal use - from Spark JS

* Include the api library
    * `const modules = require('../../libs/modules');`
    * `const api = modules.require('api', 'libs/api');`
* Call the method, passing the http request and any parameters
    * `api.users.fetchById(req, user_id).then(...)`
* Every API call must get an http request object which is used for authentcation.

#### External use - from The REST API

* Not implemented yet.
* Will have some form of authentication - so each API request will correspond to a user with some permissions.
* Each API call should check the user to verify if authorized for the API method call.
