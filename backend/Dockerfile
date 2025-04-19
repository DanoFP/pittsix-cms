# Etapa de build
FROM golang:1.23 AS builder

WORKDIR /app

# Copiamos todo el código fuente
COPY . .

# Compilamos un binario completamente estático
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/server ./api

# Imagen final liviana y segura
FROM gcr.io/distroless/static-debian11

WORKDIR /app
COPY --from=builder /app/server /app/server

# Ejecutamos el binario
CMD ["/app/server"]
