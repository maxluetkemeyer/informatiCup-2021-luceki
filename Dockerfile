FROM node:14.15.4-buster

RUN apt-get update -y && apt-get install python -y
RUN apt-get install python3 -y

ENV URL="wss://msoll.de/spe_ed"
ENV KEY="keinKey"
ENV TIME_URL="https://msoll.de/spe_ed_time"


EXPOSE 80
EXPOSE 443

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install

COPY . .
RUN yarn build

CMD [ "yarn", "start"]