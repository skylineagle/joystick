import { TypedPocketBase } from "@/types/db.types";
import PocketBase from "pocketbase";
import { urls } from "@/lib/urls";

export const pb = new PocketBase(urls.pocketbase) as TypedPocketBase;
pb.autoCancellation(false);
