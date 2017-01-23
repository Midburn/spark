#!/usr/bin/env bash

_send_build_notification_to_slack() {
    local is_success="${1}"
    if [ "${is_success}" == "1" ]; then
        local msg_text=":sunglasses: Travis build success"
    else
        local msg_text=":scream: Travis build failure"
    fi

    if [ "${TRAVIS_PULL_REQUEST}" == "false" ] && [ "${SLACK_LOG_WEBHOOK}" != "" ]; then
        echo "sending notification to slack"
        npm run log --username=travis-ci --emoji=satellite_antenna --text="${msg_text} https://travis-ci.org/${TRAVIS_REPO_SLUG}/builds/${TRAVIS_BUILD_ID}" --webhook="${SLACK_LOG_WEBHOOK}"
        echo
    else
        echo "skipping slack log notification because this is a pull request or SLACK_LOG_WEBHOOK is not configured"
    fi
}

_send_slack_notification() {
    local msg_text="${1}"
    if [ "${TRAVIS_PULL_REQUEST}" == "false" ] && [ "${SLACK_LOG_WEBHOOK}" != "" ]; then
        echo "sending slack notification: '${msg_text}'"
        npm run log --username=travis-ci --emoji=satellite_antenna --text="${msg_text} https://travis-ci.org/${TRAVIS_REPO_SLUG}/builds/${TRAVIS_BUILD_ID}" --webhook="${SLACK_LOG_WEBHOOK}"
        echo
    else
        echo "skipping slack notification because this is a pull request or SLACK_LOG_WEBHOOK is not configured"
        echo "'${msg_text}'"
    fi
}

_send_upload_notification_to_slack() {
    local file_url="${1}"
}

_get_deployment_package_filename() {
    echo "spark-`npm view spark version`-${TRAVIS_BRANCH}-${TRAVIS_BUILD_ID}.tar.gz"
}

_build_package() {
    local package_filename="${1}"
    echo "creating build package '${package_filename}'"
    npm run build --file="${package_filename}"
    echo
}

_upload_package() {
    local package_filename="${1}"
    if [ "${TRAVIS_PULL_REQUEST}" == "false" ] && [ "${SLACK_API_TOKEN}" != "" ]; then
        echo "uploading build package to slack"
        npm run upload --file="${package_filename}" --text="Travis build for ${TRAVIS_REPO_SLUG}, branch ${TRAVIS_BRANCH}, build number ${TRAVIS_BUILD_NUMBER}, build id ${TRAVIS_BUILD_ID}" --token="${SLACK_API_TOKEN}"
        echo
        local file_url=`cat "${package_filename}.slack_url"`
        echo
    else
        echo "skipping upload of build package to slack because this is a pull request or SLACK_API_TOKEN is not configured"
    fi
}

_get_travis_build_url() {
    echo "https://travis-ci.org/${TRAVIS_REPO_SLUG}/builds/${TRAVIS_BUILD_ID}"
}

_exit_error() {
    _send_slack_notification ":scream: Travis build failure `_get_travis_build_url`"
    exit 1
}

main() {
    local is_success="${1}"
    if [ "${is_success}" == "1" ]; then
        echo "building and uploading deployment package"
        local package_filename=`_get_deployment_package_filename`
        _build_package "${package_filename}"
        _upload_package "${package_filename}"
    else
        _exit_error
    fi

}

main "${1}"

