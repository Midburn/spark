curl https://intake.opbeat.com/api/v1/organizations/b84c966fbba94d578bf298534b6a39fa/apps/be31562f7e/releases/ \
-H "Authorization: Bearer 9cd4afaf0b3727a8c5622162463977c1fea5d2dd" \
-d rev=`git log -n 1 --pretty=format:%H` \
-d branch=`git rev-parse --abbrev-ref HEAD` \
-d status=completed
