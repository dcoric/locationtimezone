FROM node:18-slim

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json /usr/src/app/
RUN npm install --only=production

# Bundle app source
COPY . /usr/src/app

# Set environment variables for Docker
ENV DOCKER_ENV=true
ENV NODE_ENV=production
ARG API_URL
ENV API_URL=${API_URL}

# Create non-root user for security
RUN groupadd -r nodeuser && useradd -r -g nodeuser nodeuser
RUN chown -R nodeuser:nodeuser /usr/src/app
USER nodeuser

EXPOSE 7755

CMD ["node", "index.js"]
