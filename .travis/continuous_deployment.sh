#!/usr/bin/env bash

echo "TRAVIS_PULL_REQUEST=${TRAVIS_PULL_REQUEST}"
echo "TRAVIS_BRANCH=${TRAVIS_BRANCH}"
echo "CONTINUOUS_DEPLOYMENT_ENVIRONMENT_NAME=${CONTINUOUS_DEPLOYMENT_ENVIRONMENT_NAME}"
echo "TRAVIS_COMMIT=${TRAVIS_COMMIT}"
echo "TRAVIS_COMMIT_MESSAGE=${TRAVIS_COMMIT_MESSAGE}"

if [ "${CONTINUOUS_DEPLOYMENT_ENVIRONMENT_NAME}" != "" ] &&\
   [ "${TRAVIS_PULL_REQUEST}" == "false" ] &&\
   ([ "${TRAVIS_BRANCH}" == "master" ] || [ "${TRAVIS_BRANCH}" == "modernize-dockerize-kubernetize" ]) &&\
   [ "${TRAVIS_COMMIT}" != "" ] &&\
   [ "${TRAVIS_COMMIT_MESSAGE}" != "" ] &&\
   ! echo "${TRAVIS_COMMIT_MESSAGE}" | grep -- --no-deploy; then
      echo "Starting deployment for ${CONTINUOUS_DEPLOYMENT_ENVIRONMENT_NAME} environment"
      IMAGE_TAG="gcr.io/uumpa123/spark:${TRAVIS_COMMIT}"
      OPS_REPO_SLUG="Midburn/midburn-k8s"
      SECRET_JSON_FILE="`pwd`/secret-midburn-k8s-ops.json"
      ENVIRONMENT_NAME="${CONTINUOUS_DEPLOYMENT_ENVIRONMENT_NAME}"
      DOCKER_APP_DIR="/spark"
      DOCKER_OPS_DIR="/ops"
      HELM_UPDATE_VALUES='{"spark":{"image":"'${IMAGE_TAG}'"}}'
      HELM_UPDATE_COMMIT_MESSAGE="${ENVIRONMENT_NAME} spark image update --no-deploy"
      GIT_REPO_TOKEN="${K8S_OPS_GITHUB_REPO_TOKEN}"
      OPS_DOCKER_RUN_ARGS="-v `pwd`:/spark"
      DEPLOYMENT_SCRIPT="
        cd $DOCKER_OPS_DIR &&\
          ./helm_update_values.sh '${HELM_UPDATE_VALUES}' '${HELM_UPDATE_COMMIT_MESSAGE}' '${GIT_REPO_TOKEN}' '${OPS_REPO_SLUG}' &&\
          kubectl set image deployment/spark spark=${IMAGE_TAG};
        cd $DOCKER_APP_DIR &&\
          gcloud container builds submit --tag $IMAGE_TAG .;
      "
      ! (
        curl https://raw.githubusercontent.com/Midburn/midburn-k8s/master/run_docker_ops.sh > ./run_docker_ops.sh &&\
        chmod +x ./run_docker_ops.sh &&\
        openssl aes-256-cbc -K $encrypted_f2bd2a0d33d6_key -iv $encrypted_f2bd2a0d33d6_iv -in secret-midburn-k8s-ops.json.enc -out secret-midburn-k8s-ops.json -d &&\
        ./run_docker_ops.sh "" "${OPS_REPO_SLUG}" "${SECRET_JSON_FILE}" "${ENVIRONMENT_NAME}" "${DEPLOYMENT_SCRIPT}" "${OPS_DOCKER_RUN_ARGS}"
      ) && echo "Failed deployment" && exit 1
else
      echo "Skipping deployment"
fi

exit 0
