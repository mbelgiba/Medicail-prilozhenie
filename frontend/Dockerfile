# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
# When building for production, point to the real API
ENV REACT_APP_API_URL=/api
RUN npm run build

# Run stage
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build files to nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Custom nginx config for React Router & Proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
