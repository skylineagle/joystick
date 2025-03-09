FROM oven/bun:1.2.2
WORKDIR /app

RUN apt-get update && apt-get install -y sshpass curl iputils-ping

COPY package.json ./
RUN bun install --frozen-lockfile
COPY . .
CMD ["bun", "run", "src/index.ts"] 
