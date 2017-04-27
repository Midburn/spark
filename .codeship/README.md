# Codeship CI support

**warning** Codeship is not used as part of the regular test / build / deploy process, we use Travis for that

**warning** The free plan on Codeship is limited to 100 builds per month (along with other less important limitations)

## Using Codeship CI to run tests from your fork:
* login / create account [Codeship](https://codeship.com/)
* create new project
* paste the github url to your fork
* fill-in the following for the test steps:
  * Setup Commands:
    * `. .codeship/setup.sh`
  * Test Commands:
    * `. .codeship/test.sh`
* That's it, now every push to github will cause codeship to run
