

docker \
  run \
  --detach \
  --env MYSQL_ROOT_PASSWORD=root \
  --env MYSQL_USER=spark \
  --env MYSQL_PASSWORD=spark \
  --env MYSQL_DATABASE=spark \
  --name spark_mysql \
  --publish 3306:3306 \
  mysql;