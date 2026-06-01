FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npx tsx --version && npx esbuild server.ts --bundle --platform=node --format=esm --outfile=dist/server.mjs --external:pg-native --external:better-sqlite3

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN adduser -D appuser
USER appuser

EXPOSE 3001

CMD ["node", "dist/server.mjs"]
