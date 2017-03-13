#!/usr/bin/env bash

source .travis/functions.sh

if [ "${1}" == "1" ]; then
    _send_slack_success_notification
else
    _send_slack_error_notification
fi
