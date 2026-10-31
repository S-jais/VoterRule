FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/admin/ ./apps/admin/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @matdata-setu/admin... build

FROM nginx:alpine
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4001
CMD ["nginx", "-g", "daemon off;"]
