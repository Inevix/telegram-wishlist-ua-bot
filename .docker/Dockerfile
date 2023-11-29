FROM node:18

ARG NODE_ENV

RUN ln -snf /usr/share/zoneinfo/Europe/Kiev /etc/localtime && echo Europe/Kiev > /etc/timezone

RUN mkdir -p /wishlist/bot
WORKDIR /wishlist

COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./bot ./bot/

EXPOSE 27017

RUN if [ "$NODE_ENV" = "production" ]; then npm ci --omit=dev; else npm ci; fi

CMD [ "sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm start; else npm run dev; fi" ]