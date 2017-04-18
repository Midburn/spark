# Drupal Profile System.
Initial implementation still uses legacy profile management solution based on Drupal. So all user personal details is taken from there.
For that an api for loging in and searching user details, was implemented in Drupal.

## Drupal api:

Two end points where established:
* Login:
```
curl -X POST \
  https://<<prifile_api_url>>/api/user/login \
  -H 'accept: application/json' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -d 'username=<<user_name>>&password=<<password>>'
  ```  
Performes a login to drupal system. Logging in returns a user details and also a cookie for performing subsequent (serach) api calls as authenticated user.
* Search:
```
curl -X GET \
  'https://<<prifile_api_url>>/en/api/usersearch?uid=<<uid>>&mail=<<email>>' \
  -H 'accept: application/json'
  ```
Performs a user serach by email and/or uid. User needs to be logged in and have sufficient permissions to perform ther search. Therefore Spark uses a designated user credentials for the interface with the profile system.

The login is implemented in to places. One in [api_routes](../../routes/api_routes.js) for user login, the second in [drupal_access](../../libs/drupal_access.js) for the search api.

Drupal API end point and spark designated user details are defined by environment variables:

`DRUPAL_PROFILE_API_URL`

`DRUPAL_PROFILE_API_USER`

`DRUPAL_PROFILE_API_PASSWORD`

## Dummy Drupal end point for Development.
To ease the devolpment and prevent dependency on live drupal profile system 'fake' drupal end point is added.
The code can be found [here](../../routes/fake_drupal.js). It contains 3 hardcoded users list that can be expanded as needed.
To use this endpoint define `DRUPAL_PROFILE_API_URL` to `http://localhost:3000/fake_drupal` and username and password to `spark.superuser@midburn.org` and `123`
