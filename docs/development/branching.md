# Branching and patching

### Forking and cloning - initial Git setup

**Note** you can skip this step if you followed the local development environment installation guide.

To contribute to the project you should fork it - this can be done in the GitHub web interface.

Then, you should be able to get a repository URL for your fork and clone it:

```
$ git clone https://github.com/<YOUR_GITHUB_USER>/Spark.git
```

To be able to sync with Midburn repository you should add it as a remote

```
$ git remote add midburn https://github.com/Midburn/Spark.git
```

### Pulling - updating with latest changes from Midburn repository

You should always keep your branches updated with latest code from Midburn.

This can be done from any branch with git pull

```
$ git pull midburn master
```

### Branching - starting work on a new feature / bug-fix

Before starting to work, it is recommended to start from an updated master branch

```
$ git checkout master
$ git pull midburn master
```

Now you can create a new branch for your feature or bug-fix

```
$ git checkout -b <BRANCH_NAME>
```

It is recommended that your `<BRANCH_NAME>` will start with your name and short description of the your changes. For example example: `nate_updating_readme_file`

after writing some awesome code on your new shiny branch, you should `commit` changes and `merge` with origin/master, to do that use:


```
$ git commit -am "<COMMIT_MSG>"
$ git checkout master && git pull origin master
$ git checkout <YOUR_BRANCH_NAME> && git push origin <YOUR_BRANCH_NAME>
```

### Opening a pull request - the first step to merge you changes

Once you have an updated branch on your local repo which you would like to merge, you can open a pull request.

This can be done from the GitHub web interface.

Be sure to checkout our [Contribution guidelines](/CONTRIBUTING.md) to ensure your changes will be merged as soon as possible.

### Next Steps

* [Releases and deployment](/docs/development/releases-and-deployment.md)
* [Spark Contribution guidelines](/CONTRIBUTING.md)
* Further reading about git [here](http://rogerdudler.github.io/git-guide/)
