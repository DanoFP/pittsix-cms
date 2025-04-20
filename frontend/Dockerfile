FROM node:20-alpine AS builder

# Aceptar VITE_API_URL como argumento
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
COPY . .

# Instalar dependencias
RUN npm install

# Generar build con el valor de VITE_API_URL
RUN npm run build

FROM nginx:alpine

# Copiar el build de producción
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
