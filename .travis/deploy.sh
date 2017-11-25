#!/bin/bash -e

source .travis/functions.sh

if [ "${SKIP_BUILD}" != "1" ]; then
    _build_package || _exit_error "error in build stage"
fi

if [ "$TRAVIS_REPO_SLUG" = "Midburn/spark" ]; then
	echo "An official repository, yey!"
	if [ -n "${SPARK_DEPLOYMENT_KEY}" ]; then
		if [ "$TRAVIS_BRANCH" = "master" ]; then
			echo "Deploying to staging server from $TRAVIS_BRANCH branch"
			echo -e ${SPARK_DEPLOYMENT_KEY} | base64 -d > stage_machine.key
			chmod 400 stage_machine.key
			ls -l stage_machine.key
			md5sum stage_machine.key
			set +x
			scp -v -o StrictHostKeyChecking=no -o ConnectTimeout=60 -i stage_machine.key `_get_deployment_package_filename` "${SPARK_DEPLOYMENT_HOST}:/opt/spark/package.tar.gz" &&
			  ssh -v -o StrictHostKeyChecking=no -o ConnectTimeout=60 -i stage_machine.key ${SPARK_DEPLOYMENT_HOST} "/opt/spark/deploy.sh"
			RC=$?
			set -x
			rm -f stage_machine.key
			if [ $RC -eq 0 ]; then
				_exit_success "deployment completed successfully"
			else
				_exit_error "deployment failed"
			fi
		else
			echo "We don't deploy from $TRAVIS_BRANCH"
		fi
	else
		echo "Can't find deployment SSH key"
	fi
else
	echo "Not the oficial repository, not deploying"
fi
