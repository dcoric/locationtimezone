FROM node:18-slim

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

ARG API_URL
ENV API_URL=${API_URL}

EXPOSE 7755
# USER node


CMD ["node", "index.js"]
