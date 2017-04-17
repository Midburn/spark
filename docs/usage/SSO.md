# Spark SSO usage / integration guide

## end-user scenarios

Here are some scenarios to demonstrate the capabilities of the Spark SSO system

### user login
* user opens any external Spark web-site or app for the first time
* user is identified as not logged-in
  * the external web-site frontend code will look into the localStorage for a valid token (recommended - json web token but can be any other token / string which identifies the user)
  * this is a new user, so it will not find this token
* user clicks "login"
* user is redirected to Spark login page
  * **recommended** - a special SSO login url with the following logic:
    * the external web-site frontend code will redirect the user to an SSO login url on Spark site
    * e.g. `https://spark.midburn.org/ssologin/EXTERNAL_SITE_ID?continue=EXTERNAL_SITE_RETURN_PATH`
    * where EXTERNAL_SITE_ID will be replaced by for example `volunteers` or `gate`
    * EXTERNAL_SITE_RETURN_PATH will contain the path in the external web-site that the user should return to
      * pay attention to only use the path portion - the domain should be hard-coded (for security)
  * **simpler alternative** - the regular spark login page, just need to make sure user is redirected back to volunteers
* user logs-in
  * standard log-in / forgot password etc.. process in Spark
  * **recommended** -  through all pages must keep the EXTERNAL_SITE_ID and EXTERNAL_SITE_RETURN_PATH values
* logged-in: 
  * redirected to the external web-site
    * **recommended** - 
      * Spark backend generates a json web token for this user
      * Spark frontend redirects the user back to url:
        * domain according EXTERNAL_SITE_ID
        * path according to EXTERNAL_SITE_RETURN_PATH
        * add a query parameter of &t=THE_JSON_WEB_TOKEN
    * **simpler alternative** - Spark backend puts a domain level cookie which identifies the user
    * user now appears logged-in on the external site
      * external site knows user is logged in by - 
        * **recommended** - 
          * external site gets the json web token via a &t= query parameter
          * it validates the token - checks the expiry field of the json web token
        * **simpler alternative** - 
          * checks the cookie
      * stores the token / value from cookie in localStorage
      * this is all done on frontend, the external site doesn't require a backend
      * in this case the frontend only receives information that is visible to this user like:
        * user id, user name, user roles
* failed to log-in:
  * redirected to the external web-site
  * same as when logged-in but without the json web token
  * possibly with some error message

### user already logged-in to spark but to a different site
* given that:
  * user last logged-in to spark less then 30 days ago
  * user uses the same browser he used to log-in (e.g. has cookie)
* user opens a different external Spark site that he didn't access before
  * the external web-site frontend code will look into the localStorage for a valid json web token
  * it will not find this token
* user appears not logged-in
* user clicks log-in
  * same as previous scenario, user is redirected to:
  * `https://spark.midburn.org/ssologin/EXTERNAL_SITE_ID?continue=EXTERNAL_SITE_RETURN_PATH`
* user is redirected to Spark then immediately redirected back to external site
  * Spark backend recognizes this user's cookie which contains the user's json web token
  * it ensures the token is valid
  * redirects user back to the external site (same as in previous scenario)
* user is now logged-in on the external site
  * external site gets the token from the &t query parameter and stores it in localStorage

### user already logged-in to spark on the same site
* given that:
  * user last logged-in to spark less then 30 days ago
  * user uses the same browser he used to log-in (e.g. has cookie)
* user opens a an external Spark site that he logged-in to last time
  * the external web-site frontend code will look into the localStorage for a valid json web token
  * it will find a valid token
* user appears logged-in on the external site
* user can access `admin` pages - because frontend code got the user's roles from the json web token
  * no backend required on the external site (for most use-cases)

### user has active session but his permissions were revoked
* given that:
  * user last logged-in 8 hours ago (so he has active session for 30 days)
  * on last-login user had `admin` role
  * 4 hours ago - his `admin` role was revoked on Spark
* user opens an external Spark web-site or app he logged-in to last time
  * external site frontend code will find a valid json web token
  * user is logged-in
* user tries to access pages that require verification of the user
  * the json web token will contain two expiry fields:
    * the standard `exp` field - will determine the 30 days expiry of the active session
    * an additional custom `verify` field - which will contain a shorter (e.g. 4 hours) expiry for restricted data
  * only on pages that require verification, the frontend will check the `verify` field
  * if verification is needed:
    * frontend will send an ajax request to (e.g. `https://spark.midburn.org/jwt_verify`) with the user's json web token
    * the backend will verify the token, and return back a fresh verified token without the admin role
* user is denied access
  * frontend now has the re-verified token without the `admin` role

### user log-out
* given that user is logged-in
* user opens any external Spark web-site or app
* user clicks "log-out"
* user is redirected to Spark sso log-out
* user localStorage / cookie is deleted on Spark
* user is redirected back to external site (same as in login flow)

### external site backend api call
* given that user is logged-in and verified on external site frontend
* user performs an action that requires verification (e.g. delete a camp)
  * the external site frontend contacts the Spark server API to perform the action
  * the API request will contain the user's json web token
  * Spark backend definitively verifies the token (using the json web token signature)
  * Spark backend performs the action
* the action is performed
