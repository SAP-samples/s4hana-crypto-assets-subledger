FROM node:16-slim
WORKDIR /srv
COPY srv .
RUN npm install --only=production
ENV NODE_ENV=production
EXPOSE 5001
USER node
CMD [ "npm", "start" ]