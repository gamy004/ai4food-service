FROM node:16-buster

RUN apt-get update && apt-get install bash git g++ -y

WORKDIR /var/www

COPY ["package.json", "package-lock.json*", "./"]

RUN yarn

COPY . .

ENV NODE_ENV production

RUN yarn build

EXPOSE 80

CMD [ "yarn", "start:prod" ]
