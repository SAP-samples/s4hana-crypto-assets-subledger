FROM node:16-slim
WORKDIR /app
COPY srvx .
RUN chown -R node:node /app/server.js
RUN chmod 777 /app/server.js
RUN apt-get update
RUN apt-get -y install gpm procps lsof vim
RUN npm install --omit=dev --no-save --target_platform=linux --target_libc=glibc --target_arch=x64 
ENV NODE_ENV=production
EXPOSE 5003
USER node
CMD [ "npm", "start" ]