FROM node:21.3-alpine3.18

ENV NODE_ENV production

# WORKDIR /app


# Create a group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Tell docker that all future commands should run as the appuser user
USER appuser


WORKDIR /home/appuser
COPY source/package.json .
COPY source/package-lock.json .


RUN npm install --legacy-peer-deps
COPY source/pages ./pages
COPY source/public ./public
RUN echo ${version} > ./VERSION
RUN npm run build



CMD [ "npm", "start" ]
