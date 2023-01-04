FROM node:16-slim
WORKDIR /srv
COPY srv .
RUN npm install --omit=dev --no-save --target_platform=linux --target_libc=glibc --target_arch=x64 
ENV NODE_ENV=production
EXPOSE 5001
USER node
CMD [ "npm", "start" ]
