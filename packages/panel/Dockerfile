# --------- Stage 1: Build dependencies ----------
FROM oven/bun:latest as base

WORKDIR /app

COPY . .

RUN bun install --filter "@joystick/panel" --filter "@joystick/core"


# --------- Stage 2: Copy only what's needed ----------
FROM oven/bun:slim as runner

WORKDIR /app/packages/panel

RUN apt-get update && apt-get install -y sshpass curl iputils-ping

COPY --from=base /app/packages/panel /app/packages/panel
COPY --from=base /app/packages/core /app/packages/core
COPY --from=base /app/bun.lock /app/bun.lock
COPY --from=base /app/node_modules /app/node_modules

ENV NODE_ENV=production

# Run the server
CMD ["bun", "run", "src/index.ts"]