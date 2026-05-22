FROM node:lts-alpine
RUN npm install -g docsify-cli
WORKDIR /docs
EXPOSE 8000
CMD ["docsify", "serve", ".", "--port", "8000"]
