# Etapa 1: Compilación de la aplicación Expo Web
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias e instalarlas
COPY package*.json ./
RUN npm install

# Copiar el código fuente y variables de entorno
COPY . .
ENV EXPO_PUBLIC_API_URL=https://academicaimsapp-edh3c3g2eabtgqc2.westus-01.azurewebsites.net/api/v1

# Exportar la aplicación web estática a la carpeta dist
RUN npx expo export -p web

# Etapa 2: Servidor web de producción ligero
FROM node:20-alpine

WORKDIR /app

# Instalar el servidor estático 'serve'
RUN npm install -g serve

# Copiar únicamente los archivos compilados listos para producción
COPY --from=builder /app/dist ./dist

# Exponer el puerto 8081
EXPOSE 8081

# Iniciar el servidor estático
CMD ["serve", "-s", "dist", "-l", "8081"]
