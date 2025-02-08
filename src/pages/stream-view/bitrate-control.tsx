import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";

const BITRATE_PRESETS = [
  { value: "1000", label: "1000 kbps" },
  { value: "2500", label: "2500 kbps" },
  { value: "5000", label: "5000 kbps" },
  { value: "8000", label: "8000 kbps" },
];

interface BitrateControllProps {
  bitrate: number;
  handleBitrateChange: (value: number) => void;
}

export function BitrateControll({
  bitrate,
  handleBitrateChange,
}: BitrateControllProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { isMobileLandscape } = useMobileLandscape();

  const handleSelect = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      handleBitrateChange(numValue);
      setOpen(false);
      setSearch("");
    }
  };

  const showCreateOption = useMemo(() => {
    if (!search) return false;
    const numValue = parseInt(search);
    if (isNaN(numValue)) return false;

    const isNotPreset = !BITRATE_PRESETS.some(
      (preset) => preset.value === search
    );
    return isNotPreset;
  }, [search]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs sm:text-sm">Bitrate</Label>
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
              <CommandGroup>
                {BITRATE_PRESETS.map((preset) => (
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
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
