FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8080
EXPOSE 8081
EXPOSE 8082
EXPOSE 8083

CMD [ "npm", "start" ]