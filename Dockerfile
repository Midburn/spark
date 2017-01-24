FROM node:6-slim

ADD ./package.json /opt/spark/

WORKDIR /opt/spark

RUN npm install && npm cache clean

ADD . /opt/spark

#RUN ./node_modules/.bin/webpack

VOLUME /opt/spark/db

EXPOSE 3000

CMD ./node_modules/.bin/knex migrate:latest && ./node_modules/.bin/nodemon server.js