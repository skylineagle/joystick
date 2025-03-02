import { AddDeviceModal } from "@/components/device/add-device-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { cn } from "@/lib/utils";
import { modeConfig } from "@/pages/dashboard/config";
import { useDeviceStore } from "@/store/device-store";
import { Search, X } from "lucide-react";
import { memo, useCallback } from "react";

function renderModeIcon(mode: string) {
  const Icon = Object.keys(modeConfig).includes(mode)
    ? modeConfig[mode as keyof typeof modeConfig].icon
    : modeConfig.all.icon;

  return (
    <Icon
      className={cn(
        "h-4 w-4",
        modeConfig[mode as keyof typeof modeConfig].color
      )}
    />
  );
}

export const Filters = memo(() => {
  const {
    searchQuery,
    selectedModes,
    setSearchQuery,
    clearMode,
    clearFilters,
    isReversed,
    toggleReversed,
  } = useDeviceStore();
  const isAllowedToCreateDevice = useIsPermitted("create-device");

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cameras..."
            className="pl-9 pr-[100px]"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Switch
              checked={isReversed}
              onCheckedChange={toggleReversed}
              id="reverse-filter"
              className="data-[state=checked]:bg-primary"
            />
            <label
              htmlFor="reverse-filter"
              className="text-xs text-muted-foreground cursor-pointer select-none whitespace-nowrap"
            >
              Reverse
            </label>
          </div>
        </div>

        {isAllowedToCreateDevice && <AddDeviceModal />}
      </div>
      {(selectedModes.length > 0 || searchQuery) && (
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-2">
            {selectedModes.map((mode) => (
              <Badge
                key={mode}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {renderModeIcon(mode as keyof typeof modeConfig)}
                <span>
                  {modeConfig?.[mode as keyof typeof modeConfig]?.label}
                </span>
                <X
                  className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => clearMode(mode)}
                />
              </Badge>
            ))}
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                <span>{searchQuery}</span>
                <X
                  className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => setSearchQuery("")}
                />
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
});
