FROM node:alpine
WORKDIR "/app"
COPY ./package.json ./
RUN npm install
COPY . .
# start is the command in the scripts section in package.json file
CMD ["npm", "run", "start"]