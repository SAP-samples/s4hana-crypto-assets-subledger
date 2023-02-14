FROM node:16-slim
WORKDIR /app
COPY sqlite .
RUN rm -f /app/default-env.json
RUN rm -rf /app/node_modules
RUN npm install --omit=dev --no-save --target_platform=linux --target_libc=glibc --target_arch=x64 
RUN chown -R node:node /app/server.js
RUN chmod 777 /app/server.js
RUN apt-get update
RUN apt-get -y install gpm procps lsof vim sqlite3
ENV NODE_ENV=production
RUN chown -R node:node /app/data
RUN chmod 777 /app/data
RUN rm -f /app/data/empty.dir
EXPOSE 5003
USER node
CMD [ "npm", "start" ]