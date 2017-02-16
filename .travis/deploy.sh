#!/usr/bin/env bash

source .travis/functions.sh

if [ "${SKIP_BUILD}" != "1" ]; then
    _build_package || _exit_error "error in build stage"
fi

if [ "${SKIP_UPLOAD}" != "1" ]; then
    _upload_package || _exit_error "error in upload stage"
fi

if [ "${SKIP_DEPLOY}" != "1" ]; then
    _deploy || _exit_error "error in deploy stage"
fi

_exit_success "deployment completed successfully"
