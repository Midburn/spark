FROM node:8

RUN adduser --system --home /spark spark

# copy the minimal required files to run yarn install (for faster docker builds)
COPY .bowerrc /spark/
COPY .npmrc /spark/
COPY .yarnrc /spark/
COPY bower.json /spark/
COPY package.json /spark/
COPY yarn.lock /spark/
RUN chown -R spark /spark/

USER spark
WORKDIR /spark
RUN yarn install --ignore-scripts --pure-lockfile && yarn run bower install

COPY . /spark/

USER root
RUN chown -R spark /spark
USER spark

ENTRYPOINT ["entrypoint.sh"]
