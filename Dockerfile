FROM node:18-alpine

WORKDIR /app
COPY package.json yarn.lock index.js /app/
COPY public /app/public/
ENV NODE_ENV=production
RUN yarn install
ENTRYPOINT [ "node", "index.js" ]
