#!/usr/bin/env bash

if [ "${DEPLOY_ENVIRONMENT}" != "" ] && [ "${TRAVIS_PULL_REQUEST}" == "false" ] &&\
   [ "${TRAVIS_BRANCH}" == "${DEPLOY_BRANCH}" ] &&\
   [ "${TRAVIS_COMMIT_MESSAGE}" != "" ] && ! echo "${TRAVIS_COMMIT_MESSAGE}" | grep -- --no-deploy && [ "${TRAVIS_COMMIT}" != "" ]
then
    openssl aes-256-cbc -K $encrypted_f2bd2a0d33d6_key -iv $encrypted_f2bd2a0d33d6_iv -in ./midburn-k8s-ops.json.enc -out ./secret-midburn-k8s-ops.json -d
    OPS_REPO_SLUG="Midburn/midburn-k8s"
    OPS_REPO_BRANCH="master"
    IMAGE_TAG="gcr.io/uumpa123/spark:${TRAVIS_COMMIT}"
    B64_UPDATE_VALUES=`echo '{"spark":{"image":"'${IMAGE_TAG}'"}}' | base64 -w0`
    HELM_UPDATE_COMMIT_MESSAGE="${DEPLOY_ENVIRONMENT} spark image update --no-deploy"
    wget https://raw.githubusercontent.com/OriHoch/sk8s-ops/master/run_docker_ops.sh
    chmod +x run_docker_ops.sh
    ! ./run_docker_ops.sh "${DEPLOY_ENVIRONMENT}" "
        ! ./helm_update_values.sh '${B64_UPDATE_VALUES}' '${HELM_UPDATE_COMMIT_MESSAGE}' '${K8S_OPS_GITHUB_REPO_TOKEN}' '${OPS_REPO_SLUG}' '${OPS_REPO_BRANCH}' \
            && echo 'failed helm update values' && exit 1;
        cd /spark;
        ! gcloud container builds submit --tag $IMAGE_TAG . \
            && echo 'failed to build spark image' && exit 1
        exit 0
      " "orihoch/sk8sops" "${OPS_REPO_SLUG}" "${OPS_REPO_BRANCH}" "./secret-midburn-k8s-ops.json" "-v `pwd`:/spark" \
        && echo 'failed to run docker ops' && exit 1
fi

exit 0
