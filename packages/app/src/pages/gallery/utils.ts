import { GalleryResponse } from "@/types/db.types";

export function getEventState(event: GalleryResponse, userId: string) {
  if (event.flagged) return "flagged";
  if (!event.event) return "new";
  if (event.viewed?.includes(userId)) return "viewed";
  return "pulled";
}
