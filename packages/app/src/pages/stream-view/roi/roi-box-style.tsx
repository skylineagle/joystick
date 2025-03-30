import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BorderStyle, useRoiStyleStore } from "@/store/roi-style-store";
import { cn } from "@/lib/utils";
import { Paintbrush, RotateCcw } from "lucide-react";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";

interface RoiBoxStyleProps {
  deviceId: string;
  roiId: string;
}

export function RoiBoxStyle({ deviceId, roiId }: RoiBoxStyleProps) {
  const { getStylesForDevice, setRoiStyle, resetRoiStyle, getRoiStyle } =
    useRoiStyleStore();
  const { roiStyles } = getStylesForDevice(deviceId);
  const style = getRoiStyle(deviceId, roiId, false); // Get the non-selected style
  const hasCustomStyle = Boolean(roiStyles?.[roiId]);
  const { isMobileLandscape } = useMobileLandscape();

  const borderStyles: { value: BorderStyle; label: string }[] = [
    { value: "solid", label: "Solid" },
    { value: "dashed", label: "Dashed" },
    { value: "dotted", label: "Dotted" },
    { value: "double", label: "Double" },
  ];

  return (
    <div className="mt-1 mb-1 ml-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="size-6">
            <Paintbrush className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "w-72",
            isMobileLandscape ? "max-h-40 overflow-y-auto" : ""
          )}
        >
          <div className="flex justify-between items-center mb-3">
            <Label className="text-sm font-semibold">Customize ROI Style</Label>
            {hasCustomStyle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => resetRoiStyle(deviceId, roiId)}
                className="size-6"
                title="Reset to default style"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs">Border Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-5 h-5 rounded border"
                  style={{ backgroundColor: style.borderColor }}
                />
                <Input
                  type="color"
                  value={style.borderColor}
                  onChange={(e) =>
                    setRoiStyle(deviceId, roiId, {
                      borderColor: e.target.value,
                    })
                  }
                  className="w-full h-8"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Border Style</Label>
              <Select
                value={style.borderStyle}
                onValueChange={(value: BorderStyle) =>
                  setRoiStyle(deviceId, roiId, { borderStyle: value })
                }
              >
                <SelectTrigger className="w-full h-8 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {borderStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Border Width</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={[style.borderWidth]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(value) =>
                    setRoiStyle(deviceId, roiId, { borderWidth: value[0] })
                  }
                />
                <span className="text-xs w-4">{style.borderWidth}</span>
              </div>
            </div>

            <div>
              <Label className="text-xs">Fill Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-5 h-5 rounded border"
                  style={{ backgroundColor: style.fillColor }}
                />
                <Input
                  type="color"
                  value={style.fillColor}
                  onChange={(e) =>
                    setRoiStyle(deviceId, roiId, { fillColor: e.target.value })
                  }
                  className="w-full h-8"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Fill Opacity</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={[style.fillOpacity * 100]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) =>
                    setRoiStyle(deviceId, roiId, {
                      fillOpacity: value[0] / 100,
                    })
                  }
                />
                <span className="text-xs w-8">
                  {Math.round(style.fillOpacity * 100)}%
                </span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
