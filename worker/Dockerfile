FROM node:alpine
WORKDIR "/app"
COPY ./package.json ./
RUN npm install
COPY . .
# The start script from the package.json file
CMD ["npm", "run", "start"]