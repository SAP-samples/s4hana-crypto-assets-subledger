FROM node:16-slim
WORKDIR /app
COPY app .
RUN npm install --only=production --target_platform=linux --target_libc=glibc --target_arch=x64 
ENV NODE_ENV=production
EXPOSE 5000
USER node
CMD [ "npm", "start" ]