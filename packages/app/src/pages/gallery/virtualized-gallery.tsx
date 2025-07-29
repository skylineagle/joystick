import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useEffect, useCallback, useState } from "react";
import { GalleryEvent } from "./gallery-event";
import { GalleryResponse } from "@/types/db.types";
import { MetadataValue } from "@/types/types";
import { Loader2 } from "lucide-react";

interface VirtualizedGalleryProps {
  events: GalleryResponse<Record<string, MetadataValue>>[];
  viewMode: "grid" | "list";
  handleFocusEvent: (event: GalleryResponse) => void;
  selectedEvents: Set<string>;
  toggleEventSelection: (eventId: string) => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

const GRID_ITEM_HEIGHT = 320;
const LIST_ITEM_HEIGHT = 100;

const getColumnCount = (width: number): number => {
  if (width >= 768) return 4; // md and above - all use 4 columns
  return 1; // sm and below
};

export function VirtualizedGallery({
  events,
  viewMode,
  handleFocusEvent,
  selectedEvents,
  toggleEventSelection,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: VirtualizedGalleryProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(4);

  useEffect(() => {
    const updateColumnCount = () => {
      if (parentRef.current) {
        const width = parentRef.current.offsetWidth;
        setColumnCount(getColumnCount(width));
      }
    };

    updateColumnCount();
    const resizeObserver = new ResizeObserver(updateColumnCount);

    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const rowVirtualizer = useVirtualizer({
    count:
      viewMode === "grid"
        ? Math.ceil(events.length / columnCount)
        : events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () =>
      viewMode === "grid" ? GRID_ITEM_HEIGHT : LIST_ITEM_HEIGHT,
    overscan: 5,
  });

  const handleScroll = useCallback(() => {
    if (!hasMore || isLoadingMore) return;

    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const threshold = 200;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    const scrollElement = parentRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  if (viewMode === "grid") {
    const totalRows = Math.ceil(events.length / columnCount);
    const hasLoadMoreRow = hasMore && events.length > 0;

    return (
      <div ref={parentRef} className="h-full overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * columnCount;
            const rowItems = events.slice(startIndex, startIndex + columnCount);
            const isLastRow = virtualRow.index === totalRows - 1;

            return (
              <div
                key={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 p-4"
              >
                {rowItems.map((event, index) => (
                  <GalleryEvent
                    key={event.id}
                    event={event}
                    index={startIndex + index}
                    handleFocusEvent={handleFocusEvent}
                    viewMode={viewMode}
                    isSelected={selectedEvents.has(event.id)}
                    onSelect={() => toggleEventSelection(event.id)}
                  />
                ))}
                {isLastRow && hasLoadMoreRow && (
                  <div className="col-span-full flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm rounded-lg border">
                    {isLoadingMore ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Loading more events...
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={onLoadMore}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Load more events...
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const event = events[virtualRow.index];

          if (!event) {
            return (
              <div
                key={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex items-center justify-center p-4"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Loading more events...
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No more events
                  </span>
                )}
              </div>
            );
          }

          return (
            <div
              key={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="p-4"
            >
              <GalleryEvent
                event={event}
                index={virtualRow.index}
                handleFocusEvent={handleFocusEvent}
                viewMode={viewMode}
                isSelected={selectedEvents.has(event.id)}
                onSelect={() => toggleEventSelection(event.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
