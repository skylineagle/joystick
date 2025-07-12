# Build stage
FROM oven/bun:latest as builder
WORKDIR /app

# Copy package files
COPY package.json ./
RUN bun i --frozen-lockfile


# Copy source code and env files
COPY . .

# Build arguments for environment variables
ARG VITE_STREAM_URL
ARG VITE_POCKETBASE_URL

# Set environment variables for build
ENV VITE_STREAM_URL=$VITE_STREAM_URL
ENV VITE_POCKETBASE_URL=$VITE_POCKETBASE_URL

ENV NODE_ENV=production

RUN bun run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 