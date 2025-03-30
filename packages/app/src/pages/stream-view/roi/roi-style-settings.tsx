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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BorderStyle, useRoiStyleStore } from "@/store/roi-style-store";
import { cn } from "@/lib/utils";
import { Paintbrush } from "lucide-react";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";

interface RoiStyleSettingsProps {
  deviceId: string;
}

export function RoiStyleSettings({ deviceId }: RoiStyleSettingsProps) {
  const { getStylesForDevice, setDefaultStyle, setSelectedStyle } =
    useRoiStyleStore();
  const { defaultStyle, selectedStyle } = getStylesForDevice(deviceId);
  const { isMobileLandscape } = useMobileLandscape();

  const borderStyles: { value: BorderStyle; label: string }[] = [
    { value: "solid", label: "Solid" },
    { value: "dashed", label: "Dashed" },
    { value: "dotted", label: "Dotted" },
    { value: "double", label: "Double" },
  ];

  return (
    <div className="mt-2">
      <Label className="text-xs sm:text-sm mb-2 block">ROI Style</Label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-8 sm:h-10 text-xs sm:text-sm flex justify-between items-center gap-2"
          >
            <span>Customize ROI Style</span>
            <Paintbrush className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "w-80",
            isMobileLandscape ? "max-h-40 overflow-y-auto" : ""
          )}
          align="center"
        >
          <Tabs defaultValue="default">
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="default">Default Style</TabsTrigger>
              <TabsTrigger value="selected">Selected Style</TabsTrigger>
            </TabsList>

            <TabsContent value="default" className="space-y-2">
              <div>
                <Label className="text-xs">Border Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: defaultStyle.borderColor }}
                  />
                  <Input
                    type="color"
                    value={defaultStyle.borderColor}
                    onChange={(e) =>
                      setDefaultStyle(deviceId, { borderColor: e.target.value })
                    }
                    className="w-full h-8"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Border Style</Label>
                <Select
                  value={defaultStyle.borderStyle}
                  onValueChange={(value: BorderStyle) =>
                    setDefaultStyle(deviceId, { borderStyle: value })
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
                    value={[defaultStyle.borderWidth]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={(value) =>
                      setDefaultStyle(deviceId, { borderWidth: value[0] })
                    }
                  />
                  <span className="text-xs w-4">
                    {defaultStyle.borderWidth}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-xs">Fill Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: defaultStyle.fillColor }}
                  />
                  <Input
                    type="color"
                    value={defaultStyle.fillColor}
                    onChange={(e) =>
                      setDefaultStyle(deviceId, { fillColor: e.target.value })
                    }
                    className="w-full h-8"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Fill Opacity</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[defaultStyle.fillOpacity * 100]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) =>
                      setDefaultStyle(deviceId, { fillOpacity: value[0] / 100 })
                    }
                  />
                  <span className="text-xs w-8">
                    {Math.round(defaultStyle.fillOpacity * 100)}%
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="selected" className="space-y-2">
              <div>
                <Label className="text-xs">Border Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: selectedStyle.borderColor }}
                  />
                  <Input
                    type="color"
                    value={selectedStyle.borderColor}
                    onChange={(e) =>
                      setSelectedStyle(deviceId, {
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
                  value={selectedStyle.borderStyle}
                  onValueChange={(value: BorderStyle) =>
                    setSelectedStyle(deviceId, { borderStyle: value })
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
                    value={[selectedStyle.borderWidth]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={(value) =>
                      setSelectedStyle(deviceId, { borderWidth: value[0] })
                    }
                  />
                  <span className="text-xs w-4">
                    {selectedStyle.borderWidth}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-xs">Fill Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: selectedStyle.fillColor }}
                  />
                  <Input
                    type="color"
                    value={selectedStyle.fillColor}
                    onChange={(e) =>
                      setSelectedStyle(deviceId, { fillColor: e.target.value })
                    }
                    className="w-full h-8"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Fill Opacity</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[selectedStyle.fillOpacity * 100]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) =>
                      setSelectedStyle(deviceId, {
                        fillOpacity: value[0] / 100,
                      })
                    }
                  />
                  <span className="text-xs w-8">
                    {Math.round(selectedStyle.fillOpacity * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-xs">Highlight Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: selectedStyle.highlightColor }}
                  />
                  <Input
                    type="color"
                    value={
                      selectedStyle.highlightColor.startsWith("rgba")
                        ? "#ffffff"
                        : selectedStyle.highlightColor
                    }
                    onChange={(e) => {
                      const color = e.target.value;
                      // Convert hex to rgba with the current opacity
                      const r = parseInt(color.substring(1, 3), 16);
                      const g = parseInt(color.substring(3, 5), 16);
                      const b = parseInt(color.substring(5, 7), 16);
                      setSelectedStyle(deviceId, {
                        highlightColor: `rgba(${r}, ${g}, ${b}, 0.5)`,
                      });
                    }}
                    className="w-full h-8"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}
