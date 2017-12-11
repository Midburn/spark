FROM node:8

RUN npm install -g node-sass --unsafe

RUN adduser --system spark
COPY .bowerrc .npmrc .yarnrc bower.json package.json yarn.lock /home/spark/
RUN chown -R spark /home/spark/
USER spark
RUN cd /home/spark && yarn install --ignore-scripts --pure-lockfile && yarn run bower install

USER root
COPY . /home/spark
WORKDIR /home/spark

ENTRYPOINT ["/home/spark/entrypoint.sh"]
