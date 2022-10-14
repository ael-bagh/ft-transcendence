FROM node:lts
RUN mkdir -p /app
WORKDIR /app
RUN npm i -g @nestjs/cli --silent

COPY . /app
# RUN apt-get install vite
COPY ./package.json .
COPY ./package-lock.json .
# ENV NODE_ENV=production
RUN npm install --silent
RUN npm install serve -g

RUN npm install
EXPOSE 3000
# CMD ["bash"]

RUN npm run build
CMD ["npm", "run", "serve"]



