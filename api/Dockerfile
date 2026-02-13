FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY api/package.json api/
RUN npm ci --workspace=@aufi/api --workspace=@aufi/shared
COPY shared/ shared/
COPY api/ api/
RUN npm run build -w @aufi/api

FROM node:22-slim
WORKDIR /app
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/shared/package.json shared/
COPY --from=builder /app/api/package.json api/
RUN npm ci --workspace=@aufi/api --workspace=@aufi/shared --omit=dev
COPY --from=builder /app/shared/ shared/
COPY --from=builder /app/api/dist/ api/dist/

ENV PORT=8080
EXPOSE 8080
CMD ["node", "api/dist/index.js"]
