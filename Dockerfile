FROM node:8

RUN apt-get update && apt-get install -y build-essential

RUN adduser --system spark
COPY .bowerrc .npmrc .yarnrc bower.json package.json yarn.lock /home/spark/
RUN chown -R spark /home/spark/
USER spark
RUN cd /home/spark && yarn install --ignore-scripts --pure-lockfile &&\
    npm rebuild node-sass --force &&\
    yarn run bower install

USER root
COPY . /home/spark
WORKDIR /home/spark

ENV PATH="/home/spark/node_modules/.bin:${PATH}"

ENTRYPOINT ["/home/spark/entrypoint.sh"]
