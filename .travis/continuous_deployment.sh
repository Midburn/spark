#!/usr/bin/env bash

if [ "${DEPLOY_ENVIRONMENT}" != "" ] && [ "${TRAVIS_PULL_REQUEST}" == "false" ] &&\
   ([ "${TRAVIS_BRANCH}" == "${DEPLOY_BRANCH}" ] || ([ "${DEPLOY_TAGS}" == "true" ] && [ "${TRAVIS_TAG}" != "" ])) &&\
   ! echo "${TRAVIS_COMMIT_MESSAGE}" | grep -- --no-deploy
then
    openssl aes-256-cbc -K $encrypted_f2bd2a0d33d6_key -iv $encrypted_f2bd2a0d33d6_iv -in ./k8s-ops-secret.json.enc -out secret-k8s-ops.json -d
    OPS_REPO_SLUG="Midburn/midburn-k8s"
    OPS_REPO_BRANCH="master"
    wget https://raw.githubusercontent.com/OriHoch/sk8s-ops/master/run_docker_ops.sh
    chmod +x run_docker_ops.sh .travis/continuos_deployment_ops.sh
    ! ./run_docker_ops.sh "${DEPLOY_ENVIRONMENT}" "/spark/.travis/continuos_deployment_ops.sh" \
                          "orihoch/sk8s-ops" "${OPS_REPO_SLUG}" "${OPS_REPO_BRANCH}" "" "
                            -v '`pwd`:/spark'
                            -e 'B64_UPDATE_VALUES=${B64_UPDATE_VALUES}'
                            -e 'TRAVIS_TAG=${TRAVIS_TAG}'
                            -e 'TRAVIS_COMMIT=${TRAVIS_COMMIT}'
                            -e 'K8S_OPS_GITHUB_REPO_TOKEN=${K8S_OPS_GITHUB_REPO_TOKEN}'
                            -e 'OPS_REPO_SLUG=${OPS_REPO_SLUG}'
                            -e 'OPS_REPO_BRANCH=${OPS_REPO_BRANCH}'
                          " \
        && echo 'failed to run docker ops' && exit 1
fi

exit 0
