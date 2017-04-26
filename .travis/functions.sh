## getters


_is_tagged() {
    if [ "${TRAVIS_TAG}" != "" ] && [ "${TRAVIS_REPO_SLUG}" == "Midburn/Spark" ]; then
        echo "1"
    else
        echo "0"
    fi
}

_get_package_version() {
    if [ `_is_tagged` == "1" ]; then
        echo "${TRAVIS_TAG}"
    else
        npm view spark version
    fi
}

_get_deployment_package_filename() {
    if [ `_is_tagged` == "1" ]; then
        echo "spark-`_get_package_version`.tar.gz"
    else
        echo "spark-`_get_package_version`-${TRAVIS_BRANCH}-${TRAVIS_BUILD_ID}.tar.gz"
    fi
}

_get_build_details() {
    echo "REPO_SLUG=${TRAVIS_REPO_SLUG} BRANCH=${TRAVIS_BRANCH} BUILD_NUMBER=${TRAVIS_BUILD_NUMBER} BUILD_ID=${TRAVIS_BUILD_ID}"
}

_get_travis_build_url() {
    echo "https://travis-ci.org/${TRAVIS_REPO_SLUG}/builds/${TRAVIS_BUILD_ID}"
}

_get_package_url() {
    local package_filename=`_get_deployment_package_filename`
    if [ -f "${package_filename}.slack_url" ]; then
        cat "${package_filename}.slack_url"
    else
        echo ""
    fi
}


## utility functions

_send_slack_notification() {
    local msg_text="${1}"
    echo "sending slack notification: '${msg_text}'"
    if [ "${TRAVIS_PULL_REQUEST}" == "false" ] && [ "${SLACK_LOG_WEBHOOK}" != "" ]; then
        npm run log --username=travis-ci --emoji=satellite_antenna --text="${msg_text} `_get_travis_build_url`\n`_get_build_details`" --webhook="${SLACK_LOG_WEBHOOK}"
        echo
    else
        echo "skipping slack notification because this is a pull request or SLACK_LOG_WEBHOOK is not configured"
    fi
}


## the main process functions


_build_package() {
    echo "creating build package"
    if npm run build --file=`_get_deployment_package_filename`; then
        echo; echo "OK"
        return 0
    else
        echo; echo "ERROR"
        return 1
    fi
}


_upload_package() {
    if [ "${TRAVIS_PULL_REQUEST}" == "false" ] && [ "${SLACK_API_TOKEN}" != "" ]; then
        echo "uploading build package to slack"
        if npm run upload --token="${SLACK_API_TOKEN}" --file=`_get_deployment_package_filename`; then
            echo; echo "OK"
            return 0
        else
            echo; echo "ERROR"
            return 1
        fi
    else
        echo "skipping upload of build package to slack because this is a pull request or SLACK_API_TOKEN is not configured"
        return 0
    fi
}

_deploy() {
    if [ `_is_tagged` == "1" ]; then
        echo "skipping release notification because we are using autoscaling groups and launch configurations now"
        # if [ "${SPARK_RELEASE_NOTIFICATION_KEY}" != "" ] && [ "${SPARK_RELEASE_NOTIFICATION_HOST}" != "" ]; then
        #     echo -e "${SPARK_RELEASE_NOTIFICATION_KEY}" > release_notify.key
        #     chmod 400 release_notify.key
        #     if ssh -o StrictHostKeyChecking=no -i release_notify.key "${SPARK_RELEASE_NOTIFICATION_HOST}" `_get_package_version` `_get_package_url`; then
        #         echo; echo "OK"
        #         return 0
        #     else
        #         echo; echo "ERROR"
        #         return 1
        #     fi
        # else
        #     echo "skipping release notification because no SPARK_RELEASE_NOTIFICATION_KEY or SPARK_RELEASE_NOTIFICATION_HOST variables"
        # fi
    elif [ "${TRAVIS_BRANCH}" == "master" ] && [ "${TRAVIS_PULL_REQUEST}" == "false" ] && [ "${SLACK_API_TOKEN}" != "" ] && [ "${SPARK_DEPLOYMENT_HOST}" != "" ]; then
        if [ ! -f deployment.key ]; then
            echo -e "${SPARK_DEPLOYMENT_KEY}" > deployment.key
        fi
        chmod 400 deployment.key
        if ssh -o StrictHostKeyChecking=no -i deployment.key "${SPARK_DEPLOYMENT_HOST}" `_get_package_url`; then
            echo; echo "OK"
            return 0
        else
            echo; echo "ERROR"
            return 1
        fi
    else
        echo "skipping deployment"
        return 0
    fi
}

_send_slack_error_notification() {
    _send_slack_notification ":scream: Travis build failure"
}

_send_slack_success_notification() {
    _send_slack_notification ":sunglasses: Travis build success\npackage_url=`_get_package_url`\n"
    if [ `_is_tagged` == "1" ]; then
        _send_slack_notification ":champagne: Spark release `_get_package_version` is ready for deployment!"
    fi
}

_exit_error() {
    echo "${1}"
    echo "ERROR!"
    exit 1
}

_exit_success() {
    echo "${1}"
    echo "GREAT SUCCESS!"
    exit 0
}
