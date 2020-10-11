# builder stage
FROM node:alpine as builder
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY . .
RUN npm run build

# run stage (The React app will be served via nginx in production environment. It means we have two nginx instances: one for the entire application and the other specifically for serving the React App!)
FROM nginx
# In this setup the nginx server will listen to port 3000 in order to serve the React App files in production environment
EXPOSE 3000
# Copy the specially created nginx configuration file for the React app and overwrite the default.conf file of the nginx image
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# copy the build result from the previous stage (builder stage) to the nginx html directory
COPY --from=builder /app/build /usr/share/nginx/html