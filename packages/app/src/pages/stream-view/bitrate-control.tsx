import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBitrate } from "@/hooks/use-bitrate";
import { useDevice } from "@/hooks/use-device";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Plus, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

interface BitrateControllProps {
  deviceId: string;
}

export function BitrateControll({ deviceId }: BitrateControllProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { isMobileLandscape } = useMobileLandscape();
  const { data: device } = useDevice(deviceId);
  const { bitrate, setBitrate, refreshBitrate } = useBitrate(deviceId);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSelect = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setBitrate(numValue);
      setOpen(false);
      setSearch("");
    }
  };

  const showCreateOption = useMemo(() => {
    if (!search) return false;
    const numValue = parseInt(search);
    if (isNaN(numValue)) return false;

    const isNotPreset = !device?.information?.bitrate_presets?.[search];
    return isNotPreset;
  }, [device?.information?.bitrate_presets, search]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBitrate();
    setIsRefreshing(false);
  };

  const bitratePresets = useMemo(() => {
    if (!device?.information?.bitrate_presets) return null;

    return Object.entries(device.information.bitrate_presets).map(
      ([label, value]) => ({
        value: value.toString(),
        label,
      })
    );
  }, [device?.information?.bitrate_presets]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs sm:text-sm">Bitrate</Label>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn("h-6 w-6", isMobileLandscape ? "h-5 w-5" : "h-6 w-6")}
        >
          <RefreshCw
            className={cn(
              "h-3 w-3",
              isMobileLandscape ? "h-2.5 w-2.5" : "h-3 w-3",
              isRefreshing && "animate-spin"
            )}
          />
          <span className="sr-only">Refresh bitrate</span>
        </Button>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full text-xs sm:text-sm justify-between",
              isMobileLandscape ? "h-7" : "h-8 sm:h-10"
            )}
          >
            {bitrate} kbps
            <ChevronsUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-full p-0", isMobileLandscape && "max-h-[120px]")}
          align="start"
        >
          <Command shouldFilter={false} className="max-h-[300px]">
            <CommandInput
              placeholder="Enter bitrate..."
              value={search}
              onValueChange={setSearch}
              className={cn(
                "text-xs sm:text-sm",
                isMobileLandscape ? "h-7" : "h-8 sm:h-10"
              )}
            />
            <CommandList>
              {showCreateOption && (
                <CommandItem
                  value={search}
                  onSelect={() => handleSelect(search)}
                  className={cn(
                    "text-xs sm:text-sm px-2",
                    isMobileLandscape ? "h-7" : "h-8 sm:h-10"
                  )}
                >
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{search} kbps</span>
                </CommandItem>
              )}
              {bitratePresets && (
                <CommandGroup>
                  {bitratePresets.map((preset) => (
                    <CommandItem
                      key={preset.value}
                      value={preset.value}
                      onSelect={() => handleSelect(preset.value)}
                      className={cn(
                        "text-xs sm:text-sm px-2",
                        isMobileLandscape ? "h-7" : "h-8 sm:h-10"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0",
                          bitrate?.toString() === preset.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span className="truncate">{preset.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
