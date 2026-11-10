# ---------- build stage ----------
FROM node:24-alpine AS build
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN apk upgrade --no-cache \
 && corepack enable \
 && corepack prepare pnpm@10.33.3 --activate
WORKDIR /app
COPY . .
# تطبيق Vite يقرأ PORT و BASE_PATH وقت البناء
ENV PORT=3000
ENV BASE_PATH=/
RUN pnpm install --frozen-lockfile \
 && pnpm run typecheck:libs \
 && pnpm --filter @workspace/tafaweq-learning run build

# ---------- runtime stage ----------
FROM nginx:1.29-alpine AS runtime
RUN apk upgrade --no-cache
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/artifacts/tafaweq-learning/dist/public /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
