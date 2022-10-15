# Build from alpine nodejs image
FROM node:16-alpine

# Create working directory /app
WORKDIR /app

# Create both folders for client and server
RUN mkdir server
RUN mkdir client

# Copy package.json for both projects
COPY srcs/server/package.json ./server
COPY srcs/client/package.json ./client

# Install packages for both projects
RUN npm install --prefix '/app/server'
RUN npm install --prefix '/app/client'

# Copy remaining project files
COPY srcs/server ./server
COPY srcs/client ./client

# Build server project
RUN npm run prisma:generate --prefix '/app/server'
RUN npm run build --prefix '/app/server'

# Build client project
RUN npm run build --prefix '/app/client'

WORKDIR /app/server

# Run server
CMD [ "sh", "run.sh" ]
