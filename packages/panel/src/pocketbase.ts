import type { TypedPocketBase } from "@joystick/core";
import {
  PASSWORD,
  POCKETBASE_URL,
  USERNAME,
  SUPERUSER_USERNAME,
} from "@joystick/core";
import PocketBase from "pocketbase";

export const pb = new PocketBase(POCKETBASE_URL) as TypedPocketBase;
pb.autoCancellation(false);
await pb
  .collection("_superusers")
  .authWithPassword(SUPERUSER_USERNAME, PASSWORD);

setInterval(() => {
  pb.collection("_superusers").authRefresh();
}, 1000 * 60 * 2);
