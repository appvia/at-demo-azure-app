FROM node:21.3-alpine3.18

ENV NODE_ENV production

# WORKDIR /app


RUN useradd -ms /bin/bash newuser
USER newuser


WORKDIR /home/newuser
COPY source/package.json .
COPY source/package-lock.json .


RUN npm install --legacy-peer-deps
COPY source/pages ./pages
COPY source/public ./public
RUN echo ${version} > ./VERSION
RUN npm run build



CMD [ "npm", "start" ]
