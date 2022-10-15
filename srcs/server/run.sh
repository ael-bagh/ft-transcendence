#! /bin/sh
npx prisma db push
npm run prisma:generate

npm run start:prod