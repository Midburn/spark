#6.x lateste version
FROM node:boron   

RUN apt-get update && apt-get -y upgrade \
    && apt-get install --no-install-recommends -y -q mysql-client

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm install
RUN npm install -g knex


EXPOSE 3000
EXPOSE 5858

CMD [ "./scripts/run_migrations_and_start.sh", "start" ]

#ENTRYPOINT 
