# ── Etapa 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Variables de entorno en producción (Azure)
ENV EXPO_PUBLIC_API_URL=https://academicaimsapp-edh3c3g2eabtgqc2.westus-01.azurewebsites.net/api/v1
ENV EXPO_PUBLIC_RECAPTCHA_SITE_KEY=6LclGsMtAAAAAKIrWUSkjX9qzOciKUrPxPk3sD_D

# Compilar la aplicación web estática → genera la carpeta dist/
RUN npx expo export -p web

# ── Etapa 2: Servidor estático de producción ─────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Instalar 'serve' como servidor estático
RUN npm install -g serve

# Copiar solo los archivos compilados de la etapa anterior
COPY --from=builder /app/dist ./dist

# Exponer el puerto 8081
EXPOSE 8081

# Servir la app estática en el puerto 8081
CMD ["serve", "-s", "dist", "-l", "8081"]
