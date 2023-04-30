# Dockerfile for React client

# Build react client
FROM node:18 as base

# Working directory be app
WORKDIR /usr/src/app

COPY package*.json ./

###  Installing dependencies

RUN npm ci && npm cache clean --force

# copy local files to app folder
COPY . .

EXPOSE 3000
