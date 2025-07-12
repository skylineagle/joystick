import { EventSchemas, Inngest } from "inngest";
import type { Events } from "./types";
import { INNGEST_BASE_URL, INNGEST_EVENT_KEY } from "@joystick/core";

export const inngest = new Inngest({
  id: "joystick",
  schemas: new EventSchemas().fromRecord<Events>(),
  eventKey: INNGEST_EVENT_KEY,
  baseUrl: INNGEST_BASE_URL,
});
