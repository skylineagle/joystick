import { EventSchemas, Inngest } from "inngest";
import type { Events } from "./types";

export const inngest = new Inngest({
  id: "joystick",
  schemas: new EventSchemas().fromRecord<Events>(),
});
