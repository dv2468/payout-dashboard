# Dockerfile for Node Express Backend

### Local ###
FROM node:18 as base

# App Directory
WORKDIR /usr/src/app

# Install Dependencies
COPY package*.json ./

RUN npm ci && npm cache clean --force

# Copy app source code
COPY . .

# Exports
EXPOSE 5001

### Production ###
FROM base as production

ENV NODE_PATH=./build

RUN npm run build