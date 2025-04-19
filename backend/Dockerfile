# --- Backend Dockerfile ---
FROM golang:1.22 AS builder

WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o server main.go

FROM gcr.io/distroless/base-debian11
WORKDIR /app
COPY --from=builder /app/server .
COPY --from=builder /app/configs ./configs
CMD ["/app/server"]