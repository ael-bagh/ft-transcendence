
FROM node:16-alpine

WORKDIR /app

COPY package.json .
# COPY package-lock.json .

RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

CMD [ "sh", "run.sh" ]
