FROM node:24-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
ENV NITRO_PRESET=node-server
RUN env -u DATABASE_URL npm run build

FROM node:24-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080

COPY --from=build --chown=node:node /app/.output ./.output
# nitro bundles PGlite into .output/server/_libs but drops its runtime assets;
# restore them so the embedded-DB fallback boots (required when DATABASE_URL is unset).
COPY --from=build --chown=node:node \
  /app/node_modules/@electric-sql/pglite/dist/pglite.data \
  /app/node_modules/@electric-sql/pglite/dist/pglite.wasm \
  /app/node_modules/@electric-sql/pglite/dist/initdb.wasm \
  ./.output/server/_libs/

USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", ".output/server/index.mjs"]
