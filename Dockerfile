FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci

# Build server
COPY server/ server/
COPY tsconfig.base.json .
RUN npm run build --workspace=server

# Build client
COPY client/ client/
RUN npm run build --workspace=client

# Production image
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/package.json /app/package-lock.json ./
COPY --from=base /app/server/package.json server/
COPY --from=base /app/client/package.json client/
RUN npm ci --omit=dev --workspace=server

COPY --from=base /app/server/dist/ server/dist/
COPY --from=base /app/client/dist/ client/dist/
COPY database/ database/

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["node", "server/dist/index.js"]
