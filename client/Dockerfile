FROM node:lts
WORKDIR /app

COPY ./package.json .
COPY ./package-lock.json .

# ENV NODE_ENV=production
RUN npm install

COPY . /app

# RUN apt-get install vite
# ENV NODE_ENV=production
RUN npm install serve -g

RUN npm install

COPY . /app

EXPOSE 3000

RUN npm run build
CMD ["npm", "run", "serve"]



