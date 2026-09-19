# Partimos de una imagen oficial y ligera
FROM node:20-alpine

# Creamos una carpeta de trabajo interna
WORKDIR /app

# Copiamos solo los archivos necesarios para instalar las dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de la aplicación
COPY . .

# Exponemos el puerto en el que la aplicación escuchará
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]