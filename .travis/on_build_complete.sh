#!/usr/bin/env bash

## getters

_get_package_version() {
    npm view spark version
}

_get_deployment_package_filename() {
    local package_version="${1}"
    local is_tagged="${2}"
    if [ "${is_tagged}" == "1" ]; then
        echo "spark-${package_version}.tar.gz"
    else
        echo "spark-${package_version}-${TRAVIS_BRANCH}-${TRAVIS_BUILD_ID}.tar.gz"
    fi
}

_get_build_details() {
    echo "REPO_SLUG=${TRAVIS_REPO_SLUG} BRANCH=${TRAVIS_BRANCH} BUILD_NUMBER=${TRAVIS_BUILD_NUMBER} BUILD_ID=${TRAVIS_BUILD_ID}"
}

_get_travis_build_url() {
    echo "https://travis-ci.org/${TRAVIS_REPO_SLUG}/builds/${TRAVIS_BUILD_ID}"
}

_get_package_url() {
    local package_version="${1}"
    local is_tagged="${2}"
    local package_filename=`_get_deployment_package_filename "${package_version}" "${is_tagged}"`
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
    local package_version="${1}"
    local is_tagged="${2}"
    echo "creating build package"
    if npm run build --file=`_get_deployment_package_filename "${package_version}" "${is_tagged}"`; then
        echo; echo "OK"
        return 0
    else
        echo; echo "ERROR"
        return 1
    fi
}


_upload_package() {
    local package_version="${1}"
    local is_tagged="${2}"
    if [ "${TRAVIS_PULL_REQUEST}" == "false" ] && [ "${SLACK_API_TOKEN}" != "" ]; then
        echo "uploading build package to slack"
        if npm run upload --token="${SLACK_API_TOKEN}" --file=`_get_deployment_package_filename "${package_version}" "${is_tagged}"`; then
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
    local package_version="${1}"
    local is_tagged="${2}"
    if [ "${TRAVIS_BRANCH}" == "master" ] && [ "${TRAVIS_PULL_REQUEST}" == "false" ] && [ "${SLACK_API_TOKEN}" != "" ]; then
        echo -e "${SPARK_DEPLOYMENT_KEY}" > deployment.key
        chmod 400 deployment.key
        if ssh -o StrictHostKeyChecking=no -i deployment.key "${SPARK_DEPLOYMENT_HOST}" "`_get_package_url "${package_version}" "${is_tagged}"`"; then
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

_exit_error_send_slack_notification() {
    _send_slack_notification ":scream: Travis build failure"
    echo
    echo "ERROR!"
    exit 1
}

_exit_success_send_slack_notification() {
    local package_version="${1}"
    local is_tagged="${2}"
    _send_slack_notification ":sunglasses: Travis build success\npackage_url=`_get_package_url "${package_version}" "${is_tagged}"`\n"
    echo
    echo "GREAT SUCCESS!"
    exit 0
}

## main function

main() {
    local is_success="${1}"
    if [ "${is_success}" == "1" ]; then
        echo "building and uploading deployment package"
        if [ "${TRAVIS_TAG}" != "" ] && [ "${TRAVIS_REPO_SLUG}" == "Midburn/Spark" ]; then
            local package_version="${TRAVIS_TAG}"
            local is_tagged="1"
        else
            local package_version=`_get_package_version`
            local is_tagged="0"
        fi
        if [ "${SKIP_BUILD}" != "1" ]; then
            _build_package "${package_version}" "${is_tagged}" || _exit_error_send_slack_notification
        fi
        if [ "${SKIP_UPLOAD}" != "1" ]; then
            _upload_package "${package_version}" "${is_tagged}" || _exit_error_send_slack_notification
        fi
        if [ "${SKIP_DEPLOY}" != "1" ]; then
            _deploy "${package_version}" "${is_tagged}" || _exit_error_send_slack_notification
        fi
        _exit_success_send_slack_notification "${package_version}" "${is_tagged}"
    else
        _exit_error_send_slack_notification
    fi
}

main "${1}"
