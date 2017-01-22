# Spark release and deployment guidelines

## GitHub releases

* https://github.com/Midburn/Spark/releases
* There should always be 1 draft release against master branch
* This draft release is updated on each merge or commit to master.

### Publishing a release

* When release is ready (e.g. have enough content / is stable enough)- you can publish it
* **Before publishing on GitHub** - you should update the [package.json](/package.json) "version" attribute to match the GitHub release you are about to publish
* merge the change in package.json to master
* don't forget to push!
* now, you can publish the release in GitHub

## Continuous integration / deployment

Travis is run on every pull requests / commit to branch.

Have a look at the [.travis.yml](/.travis.yml) to see what it does.

After tests are successful, we build a deployment package and publish it to slack.

### Testing travis build locally

You should set the following environment variables (modify accordingly..)

```
SLACK_API_TOKEN=""
SLACK_LOG_WEBHOOK=""
TRAVIS_PULL_REQUEST="false"
TRAVIS_REPO_SLUG="Midburn/Spark"
TRAVIS_BRANCH="master"
TRAVIS_BUILD_NUMBER="5"
TRAVIS_BUILD_ID="198736627323"
```

Now, run the commands from .travis.yml file
