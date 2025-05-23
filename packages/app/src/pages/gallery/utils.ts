import { GalleryResponse } from "@/types/db.types";

export function getEventState(event: GalleryResponse) {
  if (event.flagged) return "flagged";
  if (event.viewed) return "viewed";
  if (event.event) return "pulled";
  return "new";
}
