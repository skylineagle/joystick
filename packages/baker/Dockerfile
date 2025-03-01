FROM oven/bun:latest
WORKDIR /app
COPY package.json ./
RUN bun install --frozen-lockfile
COPY . .
CMD ["bun", "run", "src/index.ts"] 
