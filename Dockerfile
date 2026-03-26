FROM node:20-alpine AS build
WORKDIR /app

COPY . .
RUN test -f package.json
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
