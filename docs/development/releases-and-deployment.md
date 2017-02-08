# Spark release / deployment guidelines

## Merging pull requests and updating releases
* When merging a pull request (or committing to master) - you should update the release notes in GitHub releases
* https://github.com/Midburn/Spark/releases
* There should always be 1 draft release against master branch
* This draft release is updated on each merge or commit to master.
* draft tag name + title should both be the same, and equal to the tag name
* tag name should be in the format of vMAJOR.MINOR.PATCH - e.g. v1.0.0

## Deployment to Stage environment
* On every merge or commit to master - stage environment is updated automatically (using travis)
* you can check the travis build log if there is a problem
* travis sends notification to slack channel #sparksystemlog on every build

## Publishing a release
* When release is ready (e.g. have enough content / is stable enough)- you can publish it
* **Before publishing on GitHub** - you should update the [package.json](/package.json) "version" attribute to match the GitHub release you are about to publish
* merge the change in package.json to master
* don't forget to push!
* now, you can publish the release in GitHub

## Deploying to production
* Whenever a release is published, the production server is updated with the release name and package but does not deploy it
* currently deployment is only possible via ssh, easiest way is using the following command (in Linux):
  * `ssh -i spark_production_deployment.id_rsa ubuntu@54.171.158.83 RELEASE_TAG_NAME`

## Manual Deployment

### Create the deployment package

* ```npm run build --file=<OUTPUT_FILE_NAME>```
  * We just tar.gz the source directory while excluding some files.
  * might add some more stuff in the future - basically we want as much work done here as possible so deployment is quick

### Upload the deployment package to slack

We use slack as an easy to use repository of deployment packages.

* ```npm run upload --file=<PACKAGE_FILE_NAME> --token=<SLACK_API_TOKEN>```
  * creates a file called <PACKAGE_FILE_NAME>.slack_url containing the private package url

### Download a package from the private package url

* ```npm run download --file=<OUTPUT_FILE_NAME> --url=<PACKAGE_PRIVATE_URL> --token=<SLACK_API_TOKEN>```
  * downloads from the given private slack url to the given output file name

### Deploy the package

To deploy a package file:

* extract the package (tar.gz)
* create a .env file in the package directory with relevant configurations
* run the deploy command from the root of the extracted deployment pacakge
  * ```npm run deploy```

## Testing the deployment procedures using vagrant

There is a vagrant machine which allows to test the deployment flow locally.

It runs the flow of building a package, then extracting and deploying it locally inside the vagrant instance.

You can also download a package from slack (using ```npm run download```) and then deploy it.

To use it, [install vagrant](https://www.vagrantup.com/docs/installation/), then run the following from spark/vagrant directory:

```
spark$ cd vagrant
spark/vagrant$ vagrant up
```

Now, you can ssh into the instance, the deployed package is at /opt/spark/deployment

When you run node / npm - you will have correct version for the deployment.

For example, to start the spark web-app:

```
spark/vagrant$ vagrant ssh
ubuntu@ubuntu-xenial:~$ cd /opt/spark/deployment
ubuntu@ubuntu-xenial:/opt/spark/deployment$ node server.js
```

## Automated deployment using Travis-CI

Travis is run on every pull requests / commit to branch.

Have a look at the [.travis.yml](/.travis.yml) and [/.travis/on_build_complete.sh](/.travis/on_build_complete.sh) to see what it does.

### Travis build flow

* runs the tests
* on failure - just notify to slack (using ```npm run log```)
* if tests are successfull and it's not a pull request:
  * builds the package (using ```npm run build```)
  * uploads the package to slack (using ```npm run upload```)
  * sends notification to slack containing the built package url (using ```npm run log```)

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
SPARK_DEPLOYMENT_KEY=""
SPARK_DEPLOYMENT_HOST=""
```

Now, you can run the commands from .travis.yml file


## See Also

* [DevOps tasks and guidelines](/docs/development/devops.md)
