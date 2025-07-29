import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";
type SortOrder = "newest" | "oldest";
type EventState = "all" | "new" | "pulled" | "viewed" | "flagged";

interface GalleryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedState: EventState;
  onStateChange: (state: EventState) => void;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  selectedMediaTypes: string[];
  onMediaTypesChange: (types: string[]) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalEvents: number;
  filteredCount: number;
}

const mediaTypeConfig = {
  image: { icon: "🖼️", label: "Images" },
  video: { icon: "🎥", label: "Videos" },
  audio: { icon: "🎵", label: "Audio" },
  document: { icon: "📄", label: "Documents" },
};

export function GalleryFilters({
  searchQuery,
  onSearchChange,
  selectedState,
  onStateChange,
  sortOrder,
  onSortChange,
  selectedMediaTypes,
  onMediaTypesChange,
  viewMode,
  onViewModeChange,
  totalEvents,
  filteredCount,
}: GalleryFiltersProps) {
  const hasActiveFilters =
    searchQuery || selectedState !== "all" || selectedMediaTypes.length > 0;

  const clearAllFilters = () => {
    onSearchChange("");
    onStateChange("all");
    onMediaTypesChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-[300px]"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => onSearchChange("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 p-0 text-xs"
                  >
                    {
                      [
                        searchQuery,
                        selectedState !== "all",
                        selectedMediaTypes.length,
                      ].filter(Boolean).length
                    }
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-auto p-0 text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <Separator />

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Event State</Label>
                    <Select
                      value={selectedState}
                      onValueChange={(value: EventState) =>
                        onStateChange(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="pulled">Pulled</SelectItem>
                        <SelectItem value="viewed">Viewed</SelectItem>
                        <SelectItem value="flagged">Flagged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Select
                      value={sortOrder}
                      onValueChange={(value: SortOrder) => onSortChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Media Types</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(mediaTypeConfig).map(([type, config]) => (
                        <Button
                          key={type}
                          variant={
                            selectedMediaTypes.includes(type)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            onMediaTypesChange(
                              selectedMediaTypes.includes(type)
                                ? selectedMediaTypes.filter((t) => t !== type)
                                : [...selectedMediaTypes, type]
                            );
                          }}
                          className="justify-start"
                        >
                          <span className="mr-2">{config.icon}</span>
                          {config.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onViewModeChange("grid")}
              className={cn(viewMode === "grid" && "bg-accent")}
            >
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
              </div>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onViewModeChange("list")}
              className={cn(viewMode === "list" && "bg-accent")}
            >
              <div className="flex flex-col gap-0.5 w-4 h-4">
                <div className="bg-current rounded-sm h-1" />
                <div className="bg-current rounded-sm h-1" />
                <div className="bg-current rounded-sm h-1" />
              </div>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {filteredCount} of {totalEvents} events
          </span>
          {hasActiveFilters && (
            <Badge variant="outline" className="text-xs">
              Filtered
            </Badge>
          )}
          <span className="text-xs opacity-60">
            Ctrl+A to select all • Esc to clear
          </span>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onSearchChange("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedState !== "all" && (
            <Badge variant="secondary" className="gap-1">
              State: {selectedState}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onStateChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedMediaTypes.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {mediaTypeConfig[type as keyof typeof mediaTypeConfig]?.icon}{" "}
              {mediaTypeConfig[type as keyof typeof mediaTypeConfig]?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() =>
                  onMediaTypesChange(
                    selectedMediaTypes.filter((t) => t !== type)
                  )
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
