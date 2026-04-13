import PocketBase from "pocketbase";
import { DEFAULT_POCKETBASE_URL } from "../constants.ts";
import {
  buildDeviceRecord,
  buildModelRecord,
  devModelSeeds,
  devRunSeeds,
} from "./data.ts";

const pbUrl = process.env.POCKETBASE_URL ?? DEFAULT_POCKETBASE_URL;
const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL ?? "admin@joystick.io";
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD ?? "Aa123456";

const pb = new PocketBase(pbUrl);

const ensureActionByName = async (name: string) => {
  try {
    return await pb.collection("actions").getFirstListItem(`name="${name}"`);
  } catch {
    return await pb.collection("actions").create({ name });
  }
};

const ensureModelByName = async (name: string, body: Record<string, unknown>) => {
  try {
    const existing = await pb.collection("models").getFirstListItem(`name="${name}"`);
    await pb.collection("models").update(existing.id, body);
    return existing;
  } catch {
    return await pb.collection("models").create(body);
  }
};

const ensureDeviceByName = async (name: string, body: Record<string, unknown>) => {
  try {
    const existing = await pb.collection("devices").getFirstListItem(`name="${name}"`);
    await pb.collection("devices").update(existing.id, body);
    return existing;
  } catch {
    return await pb.collection("devices").create(body);
  }
};

const ensureRun = async (
  modelId: string,
  actionId: string,
  body: Record<string, unknown>
) => {
  try {
    const existing = await pb.collection("run").getFirstListItem(
      `device="${modelId}" && action="${actionId}"`
    );
    await pb.collection("run").update(existing.id, body);
    return existing;
  } catch {
    return await pb.collection("run").create({
      ...body,
      device: modelId,
      action: actionId,
    });
  }
};

const main = async () => {
  await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword);

  const actionIds = new Map<string, string>();
  const actionNames = [...new Set(devRunSeeds.map((r) => r.actionName))];
  for (const name of actionNames) {
    const rec = await ensureActionByName(name);
    actionIds.set(name, rec.id);
  }

  for (const seed of devModelSeeds) {
    const modelBody = buildModelRecord(seed);
    const model = await ensureModelByName(seed.modelName, modelBody);
    const deviceBody = buildDeviceRecord(seed, model.id);
    await ensureDeviceByName(seed.deviceName, deviceBody);

    for (const runSeed of devRunSeeds) {
      const actionId = actionIds.get(runSeed.actionName);
      if (!actionId) continue;

      let parameters = runSeed.parameters;
      if (runSeed.actionName === "set-mode" && parameters && typeof parameters === "object") {
        const p = structuredClone(parameters) as {
          properties?: { mode?: { enum?: string[] } };
        };
        if (p.properties?.mode) {
          p.properties.mode.enum = [...seed.modes];
        }
        parameters = p;
      }

      await ensureRun(model.id, actionId, {
        command: runSeed.command,
        parameters,
        target: runSeed.target,
      });
    }
  }

  console.log("Dev seed finished. Models:", devModelSeeds.map((s) => s.modelName).join(", "));
  console.log("Start mocks: bun run --filter @joystick/dev-tools mock-device");
  pb.authStore.clear();
};

await main();
