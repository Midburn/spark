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
* notification is sent to slack #sparksystemlog with the release name - notifying you that it's ready for deployment

## Deploying a published release
* get the package_url from the slack notification in sparksystem-log channel
* log-in to AWS
* if migrations are needed
  * open the latest spark-production launch configuration (e.g. spark-production-v2.2.2)
  * copy the userdata script
  * modify the DEPLOYMENT_PACKAGE_URL to the new url you got from sparksystem-log
  * launch a new instance directly (without the autoscaling group) using this userdata script and based on the AMI of the launch configuration
  * ssh into this new instance
  * `cd /opt/spark/latest`
  * `./knex migrate:latest`
  * if migrations worked, you can terminate this instance
* after migrations ran:
  * duplicate the latest spark-production launch configuration
  * edit the userdata and modify the DEPLOYMENT_PACKAGE_URL to the new url you got from sparksystem-log
  * save the new launch configuration with the version in the launch configuration name
  * edit the spark-production autoscaling group - to use the new launch configuration
  * raise number of instances to launch new instances with the new version
  * wait for new instance to be launched
  * reduce number of instances back to normal

## Deploying a hot-fix release
(assuming you have Git remote named midburn which points to midburn repo)
* make sure you have all tags from midburn
  * `git fetch midburn`
* go to the relevant release which is currently deployed on production
  * `git checkout v2.2.2`
* if there is no production branch - create a new one
  * `git checkout -b production`
  * `git push midburn production`
* if there is already a production branch - best to delete and create again (assuming it's only used for hotfixes)
  * `git branch -D production`
  * `git checkout -b production`
  * `git push --force midburn production`
* start working on your feature from this production branch
  * `git checkout -b your-feature-branch-name`
* make you changes as you normally would, on your feature branch, push to you fork etc..
* when you open the pull request, modify it to merge to production branch (instead of the default which is master branch)
* once pull request was merged to production branch - 
  * create a new draft release and modify it to be a release for production branch (instead of the default which is master)
  * it's common practice to increment the path part of the version (the last part) when making a hotfix
  * also, worth to note in the release notes that it's a hotfix release
* publish the release and deploy normally as any other release

**important**
* after you deploy your hotfix, it's important to backport (merge) these changes to master as well
* you can open another pull request from your feature branch - but this time for the default master branch

## (deprecated) Deploying to production using slack
**This procedure doesn't work any more, see above for deploying using the autoscaling group**
* Assuming you user is authorized (see below how to authorize)
  * Type in slack: `/spark-deploy RELEASE_TAG_NAME`
  * where RELEASE_NAME is a published github release tag name
* To authorize a user, you will need to ssh to the server and edit the /opt/spark/.env file
  * `ssh -i spark.id_rsa ubuntu@spark.midburn.org`
  * `nano /opt/spark/.env`
  * Look for `SLACK_DEPLOY_ALLOWED_USERS` - it contains comma-separated list of slack user names allows to deploy
  * Exit using `ctrl - o`
  * Restart the spark-slack service for the change in .env file to take effect, using the following command 
    * `sudo systemctl restart midburn-spark-slack.service`
  * You can browse the log files to see if there's any problem:
    * `tail /var/log/syslog`
    * `tail /var/log/spark-deploy.log`

## See Also

* [DevOps tasks and guidelines](/docs/development/devops.md)
* [Manual deployment](/docs/development/manual_deployment.md)
