import {
  FilterBar,
  LoggerFilters,
} from "@/components/history-logger/filter-bar";
import {
  getActionDisplayName,
  getUserDisplayName,
} from "@/components/history-logger/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchActionLogs } from "@/lib/analytics";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Activity, Clock, Loader2, Search, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function HistoryPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<LoggerFilters>({
    fromDate: undefined,
    toDate: undefined,
    actionId: undefined,
    deviceId: undefined,
    userId: undefined,
  });
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["actionLogs", filters],
      queryFn: ({ pageParam = 1 }) => fetchActionLogs(pageParam, 20, filters),
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.totalPages) {
          return lastPage.page + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
    });

  const filteredLogs = data?.pages.flatMap((page) =>
    page.items.filter((log) => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        log.expand?.action?.name?.toLowerCase().includes(searchLower) ||
        log.expand?.user?.name?.toLowerCase().includes(searchLower) ||
        log.expand?.device?.name?.toLowerCase().includes(searchLower)
      );
    })
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="size-full flex flex-col">
      <div className="flex items-center justify-between p-2">
        <h1 className="text-xl font-bold">Action History</h1>
      </div>
      <div className="flex items-center gap-2 p-4">
        <div className="flex-1">
          <div className="flex items-center w-full border rounded-md bg-background">
            <Search className="ml-1 size-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <FilterBar filters={filters} onFiltersChange={setFilters} />
      </div>
      <div className="flex-1 mt-2 overflow-y-auto p-2">
        <div className="flex flex-col gap-4 h-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading logs...</span>
              </div>
            </div>
          ) : filteredLogs?.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              No logs found
            </div>
          ) : (
            filteredLogs?.map((log) => (
              <Card
                key={log.id}
                className={cn(
                  "transition-all hover:shadow-md",
                  log.result?.success
                    ? "border-green-500/20 hover:border-green-500/40"
                    : "border-red-500/20 hover:border-red-500/40"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(log.created), "yyyy-MM-dd HH:mm:ss")}
                      </span>
                    </div>
                    <Badge
                      variant={log.result?.success ? "default" : "destructive"}
                      className="font-medium"
                    >
                      {log.result?.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-primary" />
                    <span className="font-medium">
                      {getActionDisplayName(
                        log.expand?.action?.name || log.action
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage
                          src={`${urls.pocketbase}/api/files/${log.expand?.user?.collectionId}/${log.expand?.user?.id}/${log.expand?.user?.avatar}`}
                          alt={
                            log.expand?.user?.username ||
                            log.expand?.user?.email
                          }
                        />
                        <AvatarFallback>
                          {getUserDisplayName(log.expand?.user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {log.expand?.user?.name || log.user}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Smartphone className="h-4 w-4" />
                      <span>{log.expand?.device?.name || log.device}</span>
                    </div>
                  </div>
                  {(log.result?.output || log.result?.error) && (
                    <div className="mt-2 p-2 rounded-md bg-muted/50">
                      {log.result.error ? (
                        <div className="text-sm text-destructive">
                          {log.result.error}
                        </div>
                      ) : (
                        <div className="text-sm">{log.result.output}</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
          <div ref={loadMoreRef} className="py-4 text-center">
            {isFetchingNextPage ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading more...</span>
              </div>
            ) : hasNextPage ? (
              <Button
                variant="ghost"
                onClick={() => fetchNextPage()}
                className="text-muted-foreground hover:text-foreground"
              >
                Load more
              </Button>
            ) : filteredLogs?.length ? (
              <div className="text-muted-foreground">No more logs to load</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
