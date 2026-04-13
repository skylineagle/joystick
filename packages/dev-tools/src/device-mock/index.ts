import {
  DEV_MODEL_ORDER,
  DEV_MODEL_PORTS,
  type DevModelKey,
} from "../constants.ts";
import { startSshMock } from "./server.ts";

const printHelp = () => {
  console.log(`Usage: bun run mock-device -- [options]

Options:
  --list              Print model keys and default ports
  --model <key>       Start one mock (default: all models)
  --port <n>          Override port when using a single --model
  --help              Show this message

Examples:
  bun run mock-device
  bun run mock-device -- --model mock-pi
  bun run mock-device -- --model mock-jetson --port 6000`);
};

const parseArgs = () => {
  const raw = process.argv.slice(2);
  const out: { list?: boolean; help?: boolean; model?: string; port?: number } =
    {};
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    if (a === "--list") out.list = true;
    else if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--model") out.model = raw[++i];
    else if (a === "--port") out.port = Number(raw[++i]);
  }
  return out;
};

const main = async () => {
  const args = parseArgs();
  if (args.help) {
    printHelp();
    return;
  }
  if (args.list) {
    for (const key of DEV_MODEL_ORDER) {
      console.log(`${key}\t${DEV_MODEL_PORTS[key]}`);
    }
    return;
  }

  const servers: { close?: (cb: () => void) => void }[] = [];

  const startOne = async (key: DevModelKey, port: number) => {
    const s = await startSshMock(port, key);
    servers.push(s);
  };

  if (args.model) {
    const key = args.model as DevModelKey;
    if (!(key in DEV_MODEL_PORTS)) {
      console.error(`Unknown model "${args.model}". Use --list.`);
      process.exit(1);
    }
    const port = args.port ?? DEV_MODEL_PORTS[key];
    await startOne(key, port);
  } else {
    for (const key of DEV_MODEL_ORDER) {
      await startOne(key, DEV_MODEL_PORTS[key]);
    }
  }

  const shutdown = () => {
    for (const s of servers) {
      s.close?.(() => {});
    }
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

await main();
