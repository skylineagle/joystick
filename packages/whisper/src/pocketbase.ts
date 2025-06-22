import {
  type TypedPocketBase,
  PASSWORD,
  POCKETBASE_URL,
  SUPERUSER_USERNAME,
} from "@joystick/core";
import PocketBase from "pocketbase";

export const pb = new PocketBase(POCKETBASE_URL) as TypedPocketBase;
pb.autoCancellation(false);
await pb
  .collection("_superusers")
  .authWithPassword(SUPERUSER_USERNAME, PASSWORD);

setInterval(() => {
  pb.collection("users").authRefresh();
}, 1000 * 60 * 2);
