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
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";

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
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">Bitrate:</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[140px] justify-between"
          >
            {bitrate} kbps
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[140px] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Enter bitrate..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {showCreateOption && (
                <CommandItem
                  value={search}
                  onSelect={() => handleSelect(search)}
                  className="text-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {search} kbps
                </CommandItem>
              )}
              <CommandGroup>
                {BITRATE_PRESETS.map((preset) => (
                  <CommandItem
                    key={preset.value}
                    value={preset.value}
                    onSelect={() => handleSelect(preset.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        bitrate?.toString() === preset.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {preset.label}
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
