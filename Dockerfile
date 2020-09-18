FROM node:12-slim

RUN npm install pm2 -g

# Create app directory
#RUN mkdir -p /usr/src/app/uploads
#RUN chown node:node /usr/src/app/uploads
RUN mkdir -p /usr/src/app/logs
RUN chown node:node /usr/src/app/logs

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json /usr/src/app/
RUN npm install --only=production

# Bundle app source
COPY . /usr/src/app

EXPOSE 3333
# USER node

CMD ["pm2-runtime", "ecosystem.config.js"]
