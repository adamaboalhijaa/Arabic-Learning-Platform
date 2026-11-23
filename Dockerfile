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
# التطبيق يعمل بمستخدم غير جذري: مجلدات الكاش وملف PID يجب أن تكون قابلة للكتابة
# من مستخدم nginx، وإلا يخرج الحاوية بالخطأ mkdir /var/cache/nginx/client_temp (13: Permission denied).
RUN apk upgrade --no-cache \
 && mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp \
      /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp /var/cache/nginx/scgi_temp \
 && chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
 && sed -i 's|^pid .*|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/artifacts/tafaweq-learning/dist/public /usr/share/nginx/html
USER nginx
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
