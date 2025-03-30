import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { useRoiMode } from "@/hooks/use-roi-mode";
import { cn } from "@/lib/utils";
import { Edit3, Eye, EyeOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useActions, useCommittedRois, useRoiState } from "react-roi";
import { useLocation } from "react-router";
import { RoiBoxStyle } from "./roi-box-style";
import { useDeviceId } from "./roi-provider";
import { useIsSupported } from "@/hooks/use-is-supported";
import { useRoiStore } from "@/store/roi-store";

type RoiMode = "hide" | "view" | "edit";

interface RegionName {
  id: string;
  name: string;
}

interface RoiModeControlProps {
  deviceId?: string; // Optional, will use context if not provided
}

export function RoiModeControl({
  deviceId: propDeviceId,
}: RoiModeControlProps = {}) {
  const contextDeviceId = useDeviceId();
  const deviceId = propDeviceId || contextDeviceId;
  const { isSupported: isRoiSupported } = useIsSupported(deviceId!, [
    "set-roi",
    "get-roi",
  ]);
  const { pathname } = useLocation();
  const { roiMode, setRoiMode } = useRoiMode();
  const { removeRoi: removeRoiFromStore } = useRoiStore();
  const { setMode, removeRoi, selectRoi } = useActions();
  const { selectedRoi } = useRoiState();
  const rois = useCommittedRois();
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);
  const [regionNames, setRegionNames] = useState<RegionName[]>([]);
  const selectedButtonRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMobileLandscape } = useMobileLandscape();

  useEffect(() => {
    if (selectedRoi && selectedButtonRef.current) {
      selectedButtonRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedRoi]);

  useEffect(() => {
    switch (roiMode) {
      case "edit":
        setMode("hybrid");
        break;
      case "view":
        setMode("select");
        break;
      case "hide":
        setMode("select");
        selectRoi(null);
        break;
    }
  }, [roiMode, setMode, selectRoi]);

  useEffect(() => {
    const newRegions = rois.filter(
      (roi) => !regionNames.some((rn) => rn.id === roi.id)
    );
    if (newRegions.length > 0) {
      setRegionNames((prev) => [
        ...prev,
        ...newRegions.map((roi) => ({
          id: roi.id,
          name: `Region ${rois.findIndex((r) => r.id === roi.id) + 1}`,
        })),
      ]);
    }
  }, [regionNames, rois]);

  const handleModeChange = (value: RoiMode) => {
    setRoiMode(value);
    if (value === "hide") {
      selectRoi(null);
      setMode("select");
    }
  };

  const handleRegionClick = (roiId: string) => {
    if (roiMode !== "hide") selectRoi(roiId);
  };

  const handleDeleteRegion = (roiId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeRoi(roiId);
    if (isRoiSupported) {
      console.log("should remove roi from device");
    } else {
      removeRoiFromStore(roiId);
    }
    setRegionNames((prev) => prev.filter((rn) => rn.id !== roiId));
    if (selectedRoi === roiId) {
      selectRoi(null);
    }
  };

  const handleDoubleClick = (roiId: string) => {
    if (roiMode === "edit") {
      setEditingRegionId(roiId);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  };

  const handleNameChange = (roiId: string, newName: string) => {
    setRegionNames((prev) =>
      prev.map((rn) => (rn.id === roiId ? { ...rn, name: newName } : rn))
    );
  };

  const handleNameSubmit = () => {
    setEditingRegionId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    }
  };

  return (
    pathname.includes("stream") && (
      <div className="size-full">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs sm:text-sm">ROI Mode</Label>
        </div>
        <Select value={roiMode} onValueChange={handleModeChange}>
          <SelectTrigger className="w-full h-8 sm:h-10 text-xs sm:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="edit">
              <div className="flex items-center gap-2">
                <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Edit</span>
              </div>
            </SelectItem>
            <SelectItem value="view">
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">View</span>
              </div>
            </SelectItem>
            <SelectItem value="hide">
              <div className="flex items-center gap-2">
                <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Hide</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {rois.length > 0 && roiMode !== "hide" && (
          <div className="mt-2 size-full">
            <ScrollArea
              className={cn(
                "mt-1",
                isMobileLandscape ? "h-[80px]" : "h-[320px]"
              )}
            >
              <div className="flex flex-col gap-1 pr-2">
                {rois.map((roi) => {
                  const regionName =
                    regionNames.find((rn) => rn.id === roi.id)?.name ||
                    `Region ${rois.findIndex((r) => r.id === roi.id) + 1}`;
                  const isEditing = editingRegionId === roi.id;

                  return (
                    <div
                      key={roi.id}
                      ref={
                        roi.id === selectedRoi ? selectedButtonRef : undefined
                      }
                      onClick={() => handleRegionClick(roi.id)}
                      onDoubleClick={() => handleDoubleClick(roi.id)}
                      className={cn(
                        "text-xs sm:text-sm rounded transition-colors w-full text-left group relative",
                        isMobileLandscape ? "p-1" : "p-1.5",
                        roi.id === selectedRoi
                          ? "bg-primary text-primary-foreground pr-20"
                          : "text-foreground/80 hover:bg-accent pr-10"
                      )}
                    >
                      {isEditing ? (
                        <Input
                          ref={inputRef}
                          value={regionName}
                          onChange={(e) =>
                            handleNameChange(roi.id, e.target.value)
                          }
                          onBlur={handleNameSubmit}
                          onKeyDown={handleKeyDown}
                          className={cn(
                            "w-full px-1 py-0 text-xs sm:text-sm",
                            isMobileLandscape ? "h-5" : "h-6 sm:h-7"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex flex-col">
                          <span>{regionName}</span>
                          {roi.id === selectedRoi && (
                            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] mt-0.5 font-mono">
                              <div className="flex items-center">
                                <span className="w-3 text-muted-foreground">
                                  X:
                                </span>
                                {roi.x}
                              </div>
                              <div className="flex items-center">
                                <span className="w-3 text-muted-foreground">
                                  W:
                                </span>
                                {roi.width}
                              </div>
                              <div className="flex items-center">
                                <span className="w-3 text-muted-foreground">
                                  Y:
                                </span>
                                {roi.y}
                              </div>
                              <div className="flex items-center">
                                <span className="w-3 text-muted-foreground">
                                  H:
                                </span>
                                {roi.height}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
                        <RoiBoxStyle deviceId={deviceId} roiId={roi.id} />
                        {roi.id === selectedRoi &&
                          roiMode === "edit" &&
                          !isEditing && (
                            <button
                              onClick={(e) => handleDeleteRegion(roi.id, e)}
                              className="mr-1 sm:mr-1.5 opacity-60 hover:opacity-100"
                            >
                              <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    )
  );
}
