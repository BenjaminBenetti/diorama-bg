# Multi-stage build for Deno frontend application

# Stage 1: Build the application
FROM denoland/deno:2.4.0 AS builder

# Set working directory
WORKDIR /app

# Copy the entire workspace to have access to the lib
COPY . .

# Set working directory to the sample/basic folder
WORKDIR /app/sample/basic

# Build the application
RUN deno task build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy the built files from the builder stage
COPY --from=builder /app/sample/basic/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY sample/basic/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
