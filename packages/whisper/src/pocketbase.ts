import { PASSWORD, POCKETBASE_URL, USERNAME } from "@joystick/core";
import type { TypedPocketBase } from "@joystick/core";
import PocketBase from "pocketbase";

export const pb = new PocketBase(POCKETBASE_URL) as TypedPocketBase;
pb.autoCancellation(false);
await pb.collection("users").authWithPassword(USERNAME, PASSWORD);

setInterval(() => {
  pb.collection("users").authRefresh();
}, 1000 * 60 * 2);
