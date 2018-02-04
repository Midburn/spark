FROM node:8
RUN apt-get update && apt-get install -y build-essential mysql-client

RUN adduser --system spark
COPY .bowerrc .npmrc .yarnrc bower.json package.json yarn.lock /home/spark/
RUN chown -R spark /home/spark/
USER spark
RUN cd /home/spark && yarn install --ignore-scripts --pure-lockfile
RUN cd /home/spark && npm rebuild node-sass --force
RUN cd /home/spark && yarn run bower install

USER root
COPY . /home/spark
WORKDIR /home/spark

ENV PATH="/home/spark/node_modules/.bin:${PATH}"

ENTRYPOINT ["/home/spark/entrypoint.sh"]
