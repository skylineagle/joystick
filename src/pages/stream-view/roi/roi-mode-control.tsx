import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit3, Eye, EyeOff, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useActions, useCommittedRois, useRoiState } from "react-roi";

type RoiMode = "off" | "view" | "edit";

export function RoiModeControl() {
  const { setMode, removeRoi, selectRoi } = useActions();
  const { selectedRoi } = useRoiState();
  const rois = useCommittedRois();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [roiMode, setRoiMode] = useState<RoiMode>("view");
  const selectedButtonRef = useRef<HTMLButtonElement>(null);

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
      case "off":
        setMode("select");
        selectRoi(null);
        break;
    }
  }, [roiMode, setMode, selectRoi]);

  const handleModeChange = (value: RoiMode) => {
    setRoiMode(value);
    if (value === "off") {
      selectRoi(null);
      setMode("select");
    }
  };

  const handleClearRois = () => {
    selectRoi(null);
    rois.forEach((roi) => {
      removeRoi(roi.id);
    });
    setIsConfirmOpen(false);
  };

  const handleRegionClick = (roiId: string) => {
    if (roiMode !== "off") selectRoi(roiId);
  };

  const handleDeleteRegion = (roiId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeRoi(roiId);
    if (selectedRoi === roiId) {
      selectRoi(null);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Label
          htmlFor="roi-mode"
          className="text-sm font-medium whitespace-nowrap"
        >
          ROI Mode
        </Label>
        <Select value={roiMode} onValueChange={handleModeChange}>
          <SelectTrigger id="roi-mode" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="edit">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                <Label>Edit</Label>
              </div>
            </SelectItem>
            <SelectItem value="view">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <Label>View</Label>
              </div>
            </SelectItem>
            <SelectItem value="off">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                <Label>Off</Label>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rois.length > 0 && roiMode !== "off" && (
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-[300px]">
            <div className="overflow-x-auto flex-1 min-w-0 no-scrollbar">
              <div className="flex items-center gap-1 w-max">
                {rois.map((roi, index) => (
                  <button
                    key={roi.id}
                    ref={roi.id === selectedRoi ? selectedButtonRef : undefined}
                    onClick={() => handleRegionClick(roi.id)}
                    className={`text-sm p-1 rounded transition-colors whitespace-nowrap group relative ${
                      roi.id === selectedRoi
                        ? "bg-primary text-primary-foreground pr-7"
                        : "text-foreground/80 hover:bg-accent"
                    }`}
                  >
                    Region {index + 1}
                    {roi.id === selectedRoi && roiMode === "edit" && (
                      <button
                        onClick={(e) => handleDeleteRegion(roi.id, e)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </button>
                ))}
              </div>
            </div>
            {roiMode === "edit" && (
              <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/20 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all regions?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All regions will be
                      permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearRois}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
