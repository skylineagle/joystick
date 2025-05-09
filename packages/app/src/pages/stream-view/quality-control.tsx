import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDevice } from "@/hooks/use-device";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { useQuality } from "@/hooks/use-quality";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

type QualityPreset = {
  label: string;
  bitrate: number;
  fps: number;
};

interface QualityControlProps {
  deviceId: string;
}

export function QualityControll({ deviceId }: QualityControlProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { isMobileLandscape } = useMobileLandscape();
  const { data: device } = useDevice(deviceId);
  const { quality, setQuality, refreshQuality, isLoading } =
    useQuality(deviceId);

  const presets: QualityPreset[] = useMemo(() => {
    if (!device?.information?.quality_presets) return [];
    return Object.entries(device.information.quality_presets).map(
      ([label, value]) => {
        const preset = value as { bitrate: number; fps: number };
        return {
          label,
          bitrate: preset.bitrate,
          fps: preset.fps,
        };
      }
    );
  }, [device?.information?.quality_presets]);

  const currentLabel = useMemo(() => {
    if (!quality || !presets.length) return "";
    const match = presets.find(
      (preset) =>
        Number(quality.bitrate) === Number(preset.bitrate) &&
        Number(quality.fps) === Number(preset.fps)
    );
    if (match) return match.label;
    return "Custom";
  }, [quality, presets]);

  const handleSelect = (label: string) => {
    const preset = presets.find((p) => p.label === label);
    if (!preset) return;
    setQuality(preset.bitrate);
    setOpen(false);
    setSearch("");
  };

  const handleRefresh = async () => {
    await refreshQuality();
  };

  const filteredPresets = useMemo(() => {
    if (!search) return presets;
    return presets.filter((preset) =>
      preset.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [presets, search]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs sm:text-sm">Quality</Label>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading}
          className={cn("h-6 w-6", isMobileLandscape ? "h-5 w-5" : "h-6 w-6")}
        >
          <RefreshCw
            className={cn(
              "h-3 w-3",
              isMobileLandscape ? "h-2.5 w-2.5" : "h-3 w-3",
              isLoading && "animate-spin"
            )}
          />
          <span className="sr-only">Refresh quality</span>
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
            tabIndex={0}
            aria-label="Select quality preset"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setOpen((v) => !v);
            }}
          >
            {currentLabel && (
              <span className="truncate">
                {currentLabel === "Custom"
                  ? `Custom (${quality?.bitrate} kbps, ${quality?.fps} fps)`
                  : currentLabel}
              </span>
            )}
            <ChevronsUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-full p-0", isMobileLandscape && "max-h-[120px]")}
          align="start"
        >
          <Command shouldFilter={false} className="max-h-[300px]">
            <CommandList>
              <CommandGroup>
                {filteredPresets.map((preset) => (
                  <CommandItem
                    key={preset.label}
                    value={preset.label}
                    onSelect={() => handleSelect(preset.label)}
                    className={cn(
                      "text-xs sm:text-sm px-2",
                      isMobileLandscape ? "h-7" : "h-8 sm:h-10"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0",
                        currentLabel === preset.label
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="truncate">{preset.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
