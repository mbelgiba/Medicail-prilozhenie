# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
# Build the Go binary
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Run stage
FROM alpine:latest
WORKDIR /app

# Install timezone data and CA certificates (needed for external APIs and SSL)
RUN apk --no-cache add ca-certificates tzdata

# Copy binary from builder
COPY --from=builder /app/main .
COPY --from=builder /app/.env .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 5000
CMD ["./main"]
