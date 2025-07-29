import { pb } from "@/lib/pocketbase";
import { GalleryResponse } from "@/types/db.types";
import { MetadataValue } from "@/types/types";
import { useEffect, useState, useCallback } from "react";

const ITEMS_PER_PAGE = 20;

interface FilterOptions {
  searchQuery?: string;
  selectedState?: string;
  selectedMediaTypes?: string[];
  sortOrder?: "newest" | "oldest";
}

export function useGalleryEvents(deviceId: string, filters?: FilterOptions) {
  const [events, setEvents] = useState<
    GalleryResponse<Record<string, MetadataValue>>[]
  >([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const buildFilter = useCallback(
    (filters?: FilterOptions) => {
      let filter = `device = "${deviceId}"`;

      if (filters?.searchQuery) {
        filter += ` && event_id ~ "${filters.searchQuery}"`;
      }

      if (
        filters?.selectedMediaTypes &&
        filters.selectedMediaTypes.length > 0
      ) {
        const mediaTypeFilter = filters.selectedMediaTypes
          .map((type) => `media_type = "${type}"`)
          .join(" || ");
        filter += ` && (${mediaTypeFilter})`;
      }

      return filter;
    },
    [deviceId]
  );

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);

      const nextPage = page + 1;
      const filter = buildFilter(filters);
      const sort = filters?.sortOrder === "oldest" ? "+created" : "-created";

      pb.collection("gallery")
        .getList<GalleryResponse<Record<string, MetadataValue>>>(
          nextPage,
          ITEMS_PER_PAGE,
          {
            filter,
            sort,
          }
        )
        .then((result) => {
          setEvents((prev) => [...prev, ...result.items]);
          setHasMore(result.items.length === ITEMS_PER_PAGE);
          setPage(nextPage);
        })
        .catch((error) => {
          console.error("Failed to load more gallery events:", error);
        })
        .finally(() => {
          setIsLoadingMore(false);
        });
    }
  }, [isLoadingMore, hasMore, page, buildFilter, filters]);

  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setIsLoading(true);

    const filter = buildFilter(filters);
    const sort = filters?.sortOrder === "oldest" ? "+created" : "-created";

    pb.collection("gallery")
      .getList<GalleryResponse<Record<string, MetadataValue>>>(
        1,
        ITEMS_PER_PAGE,
        {
          filter,
          sort,
        }
      )
      .then((result) => {
        setEvents(result.items);
        setTotalCount(result.totalItems);
        setHasMore(result.items.length === ITEMS_PER_PAGE);
      })
      .catch((error) => {
        console.error("Failed to refresh gallery events:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [buildFilter, filters]);

  useEffect(() => {
    const loadInitialEvents = async () => {
      setPage(1);
      setHasMore(true);
      setIsLoading(true);

      try {
        const filter = buildFilter(filters);
        const sort = filters?.sortOrder === "oldest" ? "+created" : "-created";

        const result = await pb
          .collection("gallery")
          .getList<GalleryResponse<Record<string, MetadataValue>>>(
            1,
            ITEMS_PER_PAGE,
            {
              filter,
              sort,
            }
          );

        setEvents(result.items);
        setTotalCount(result.totalItems);
        setHasMore(result.items.length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Failed to load gallery events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialEvents();
  }, [
    buildFilter,
    deviceId,
    filters,
    filters?.searchQuery,
    filters?.selectedMediaTypes,
    filters?.sortOrder,
  ]);

  useEffect(() => {
    pb.collection("gallery").subscribe("*", (e) => {
      if (e.record.device !== deviceId) return;

      switch (e.action) {
        case "create":
          setEvents((prev) => [
            e.record as GalleryResponse<Record<string, MetadataValue>>,
            ...prev,
          ]);
          setTotalCount((prev) => prev + 1);
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
          setTotalCount((prev) => Math.max(0, prev - 1));
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

  return {
    events,
    totalCount,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  };
}
