import { Server } from "ssh2";
import { MOCK_SSH_USER } from "../constants.ts";
import { ensureHostKey } from "./host-key.ts";

type ExecChannel = {
  stderr: { write: (data: string | Buffer) => void };
  write: (data: string | Buffer) => void;
  exit: (code: number) => void;
  end: () => void;
};

const runCommand = async (command: string): Promise<{ out: string; err: string; code: number }> => {
  const proc = Bun.spawn(["/bin/sh", "-c", command], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const code = await proc.exited;
  const out = await new Response(proc.stdout).text();
  const err = await new Response(proc.stderr).text();
  return { out, err, code };
};

const handleExec = async (stream: ExecChannel, command: string) => {
  const { out, err, code } = await runCommand(command);
  if (err.length > 0) {
    stream.stderr.write(err);
  }
  stream.write(out);
  stream.exit(code === 0 ? 0 : code);
  stream.end();
};

export const startSshMock = async (port: number, label: string) => {
  const hostKey = await ensureHostKey();
  const server = new Server({ hostKeys: [hostKey] }, (client) => {
    client
      .on("authentication", (ctx) => {
        ctx.accept();
      })
      .on("ready", () => {
        client.on("session", (accept) => {
          const session = accept();
          session.once("exec", (acceptExec, _reject, info) => {
            const stream = acceptExec();
            void handleExec(stream, info.command);
          });
        });
      })
      .on("error", (err) => {
        console.error(`[${label}] client error`, err);
      });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "0.0.0.0", () => {
      server.off("error", reject);
      resolve();
    });
  });

  console.log(`SSH mock "${label}" listening on 0.0.0.0:${port} (user ${MOCK_SSH_USER}, any password)`);
  return server;
};
