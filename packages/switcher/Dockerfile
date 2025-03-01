FROM oven/bun:latest
WORKDIR /app

RUN apt-get update && apt-get install -y sshpass curl

COPY package.json ./
RUN bun install --frozen-lockfile
COPY . .
CMD ["bun", "run", "src/index.ts"] 
