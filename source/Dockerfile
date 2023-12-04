FROM node:hydrogen-alpine3.18

ENV NODE_ENV production

WORKDIR /app
COPY source/package.json .
COPY source/package-lock.json .
RUN npm install
COPY source/pages ./pages
COPY source/public ./public
RUN echo ${version} > ./VERSION
RUN npm run build

CMD [ "npm", "start" ]
