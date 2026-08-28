# Imagen base oficial de Node.js 20 sobre Alpine Linux
FROM node:20-alpine

# Directorio de trabajo del contenedor
WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias del frontend
RUN npm install

# Copiar el resto del código del frontend
COPY . .

# Exponer el puerto 8081 de la app web de Expo
EXPOSE 8081

# Comando por defecto para arrancar la app de Expo en modo web
CMD ["npx", "expo", "start", "--web", "--port", "8081"]
