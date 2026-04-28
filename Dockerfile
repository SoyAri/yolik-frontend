# ══════════════════════════════════════════════════════════════════════════════
# YOLIK FRONTEND — Dockerfile (Angular 21 SSR)
# Multi-stage build: builder → runner
# ══════════════════════════════════════════════════════════════════════════════

# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time arguments (inyectados desde docker-compose o --build-arg)
# Angular compila estas variables dentro del bundle — NO quedan como env vars
ARG API_URL=https://yolik.mx/api
ARG AUTH0_DOMAIN
ARG AUTH0_CLIENT_ID
ARG STRIPE_PUBLISHABLE_KEY

# Exponer ARGs como variables de entorno para usarlas en el script node
ENV API_URL=$API_URL
ENV AUTH0_DOMAIN=$AUTH0_DOMAIN
ENV AUTH0_CLIENT_ID=$AUTH0_CLIENT_ID
ENV STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY

# Instalar dependencias primero (capa de caché separada)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copiar el código fuente
COPY . .

# Generar environment.ts de producción con los valores inyectados
# (reemplaza el archivo con valores de desarrollo por uno de producción)
RUN node -e " \
  const fs = require('fs'); \
  const env = { \
    production: true, \
    apiUrl: process.env.API_URL, \
    auth0: { \
      domain: process.env.AUTH0_DOMAIN, \
      clientId: process.env.AUTH0_CLIENT_ID, \
    }, \
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY, \
  }; \
  const content = 'export const environment = ' + JSON.stringify(env, null, 2) + ';\n'; \
  fs.writeFileSync('src/environments/environment.ts', content); \
  console.log('environment.ts generado para producción.'); \
"

# Compilar Angular en modo producción (genera browser/ + server/ en dist/)
RUN npm run build -- --configuration production


# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Variables de entorno de ejecución
ENV NODE_ENV=production
ENV PORT=4000

# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 angular

# Copiar únicamente el output compilado (browser/ + server/)
# El bundle de @angular/ssr incluye todas las dependencias necesarias
COPY --from=builder --chown=angular:nodejs /app/dist/yolikfront ./dist/yolikfront

USER angular

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:4000/ || exit 1

CMD ["node", "dist/yolikfront/server/server.mjs"]
