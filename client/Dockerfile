FROM node:lts
WORKDIR /app

# RUN apt-get install vite
COPY package.json .
# COPY ./package-lock.json .
# ENV NODE_ENV=production
RUN npm install

COPY . /app

EXPOSE 3000
# CMD ["bash"]

RUN npm run build
CMD ["npm", "run", "serve"]



