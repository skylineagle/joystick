import { pb } from "@/lib/pocketbase";
import { GalleryResponse } from "@/types/db.types";
import { MetadataValue } from "@/types/types";
import { useEffect, useState } from "react";

export function useGalleryEvents(deviceId: string) {
  const [events, setEvents] = useState<
    GalleryResponse<Record<string, MetadataValue>>[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initEvents = async () => {
      setIsLoading(true);
      const events = await pb
        .collection("gallery")
        .getFullList<GalleryResponse<Record<string, MetadataValue>>>({
          filter: `device = "${deviceId}"`,
          sort: "-created",
        });

      setEvents(events);
      setIsLoading(false);
    };
    initEvents();

    pb.collection("gallery").subscribe("*", (e) => {
      if (e.record.device !== deviceId) return;

      switch (e.action) {
        case "create":
          setEvents((prev) => [
            ...prev,
            e.record as GalleryResponse<Record<string, MetadataValue>>,
          ]);
          break;
        case "update":
          setEvents((prev) =>
            prev.map((event) =>
              event.id === e.record.id
                ? (e.record as GalleryResponse<Record<string, MetadataValue>>)
                : event
            )
          );
          break;
        case "delete":
          setEvents((prev) => prev.filter((event) => event.id !== e.record.id));
          break;
      }
    });

    return () => {
      try {
        pb.collection("gallery")?.unsubscribe("*");
      } catch {
        // Do nothing
      }
    };
  }, [deviceId]);

  return { events, isLoading };
}
