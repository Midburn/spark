#!/usr/bin/env bash

HELM_UPDATE_COMMIT_MESSAGE="${K8S_ENVIRONMENT_NAME} spark image update --no-deploy"

RES=0

cd /ops

! ./helm_update_values.sh "${B64_UPDATE_VALUES}" "${HELM_UPDATE_COMMIT_MESSAGE}" "${K8S_OPS_GITHUB_REPO_TOKEN}" \
                          "${OPS_REPO_SLUG}" "${OPS_REPO_BRANCH}" \
    && echo 'failed helm update values' && RES=1;

! kubectl set image deployment/spark "spark=${IMAGE_TAG}" "migrations=${IMAGE_TAG}" \
    && echo 'failed to patch spark deployment' && RES=1;

! kubectl set image deployment/spark-drupal-sync "spark=${IMAGE_TAG}" \
    && echo 'failed to patch spark-drupal-sync deployment' && RES=1;

cd /spark;

! gcloud container builds submit --substitutions _IMAGE_TAG=${IMAGE_TAG} \
                                 --config bin/continuous_deployment_cloudbuild.yaml \
                                 . \
    && echo 'failed to build spark image' && RES=1;

while ! kubectl rollout status deployment spark --watch=false; do
    echo 'waiting for spark deployment rollout';
    for POD in `kubectl get pods | grep spark- | cut -d" " -f1 -`; do
        POD_JSON=`kubectl get -ojson pod $POD`;
        POD_STATUS=`echo "${POD_JSON}" | jq -r .status.phase`;
        if [ "${POD_STATUS}" != "Running" ]; then
            kubectl describe pod $POD;
            kubectl logs --tail=100 $POD -c spark;
            kubectl logs --tail=100 $POD -c migrations;
        fi;
    done;
    echo "sleeping for 60 seconds"
    sleep 60;
done;

exit $RES
