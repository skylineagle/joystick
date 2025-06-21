import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { usePtz } from "@/hooks/use-ptz";
import { cn } from "@/lib/utils";
import { AxisControl } from "@/pages/stream-view/controls/ptz/axis-control";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  ArrowUpDown,
  Move,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PtzControlProps {
  deviceId: string;
}

export function PtzControl({ deviceId }: PtzControlProps) {
  const { isMobileLandscape } = useMobileLandscape();

  const {
    ptzValue: ptzX,
    setPtzValue: setPtzX,
    refreshPtzValue: refreshPtzX,
    isLoading: isXLoading,
    isMutationLoading: isXMutationLoading,
    min: xMin,
    max: xMax,
    isSupported: isXSupported,
  } = usePtz(deviceId, "x");
  const {
    ptzValue: ptzY,
    setPtzValue: setPtzY,
    refreshPtzValue: refreshPtzY,
    isLoading: isYLoading,
    isMutationLoading: isYMutationLoading,
    min: yMin,
    max: yMax,
    isSupported: isYSupported,
  } = usePtz(deviceId, "y");

  const [isDragging, setIsDragging] = useState(false);
  const [dragPreviewX, setDragPreviewX] = useState<number | null>(null);
  const [dragPreviewY, setDragPreviewY] = useState<number | null>(null);
  const touchpadRef = useRef<HTMLDivElement>(null);

  const isLoading = isXLoading || isYLoading;
  const isMutationLoading = isXMutationLoading || isYMutationLoading;

  const handleRefresh = async () => {
    const promises = [];
    if (isXSupported) promises.push(refreshPtzX());
    if (isYSupported) promises.push(refreshPtzY());
    await Promise.all(promises);
  };

  const handleCenter = () => {
    if (isXSupported) {
      const centerX = Math.round((xMin + xMax) / 2);
      setPtzX(centerX);
    }
    if (isYSupported) {
      const centerY = Math.round((yMin + yMax) / 2);
      setPtzY(centerY);
    }
  };

  const handleTouchpadMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!touchpadRef.current || isMutationLoading) return;

      const rect = touchpadRef.current.getBoundingClientRect();

      if (isXSupported) {
        const relativeX = (clientX - rect.left) / rect.width;
        const clampedX = Math.max(0, Math.min(1, relativeX));
        const newX = Math.round(xMin + clampedX * (xMax - xMin));

        if (isDragging) {
          setDragPreviewX(newX);
        } else {
          setPtzX(newX);
        }
      }

      if (isYSupported) {
        const relativeY = (clientY - rect.top) / rect.height;
        const clampedY = Math.max(0, Math.min(1, relativeY));
        const newY = Math.round(yMax - clampedY * (yMax - yMin));

        if (isDragging) {
          setDragPreviewY(newY);
        } else {
          setPtzY(newY);
        }
      }
    },
    [
      xMax,
      xMin,
      yMax,
      yMin,
      isXSupported,
      isYSupported,
      setPtzX,
      setPtzY,
      isMutationLoading,
      isDragging,
    ]
  );

  const handleMouseDown = () => {
    if (isMutationLoading) return;
    setIsDragging(true);
    setDragPreviewX(ptzX ?? 0);
    setDragPreviewY(ptzY ?? 0);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        handleTouchpadMove(e.clientX, e.clientY);
      }
    },
    [isDragging, handleTouchpadMove]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging && !isMutationLoading) {
      if (dragPreviewX !== null && isXSupported) {
        setPtzX(dragPreviewX);
      }
      if (dragPreviewY !== null && isYSupported) {
        setPtzY(dragPreviewY);
      }
    }
    setIsDragging(false);
    setDragPreviewX(null);
    setDragPreviewY(null);
  }, [
    isDragging,
    isMutationLoading,
    dragPreviewX,
    dragPreviewY,
    isXSupported,
    isYSupported,
    setPtzX,
    setPtzY,
  ]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Early return after all hooks are called
  if (!isXSupported && !isYSupported) {
    return null;
  }

  const getCrosshairPosition = () => {
    // Get container dimensions based on supported axes
    let containerWidth, containerHeight;

    if (isXSupported && !isYSupported) {
      // X-only: wider and shorter
      containerWidth = isMobileLandscape ? 160 : 192; // w-40 = 160px, w-48 = 192px
      containerHeight = isMobileLandscape ? 64 : 80; // h-16 = 64px, h-20 = 80px
    } else if (!isXSupported && isYSupported) {
      // Y-only: taller and narrower
      containerWidth = isMobileLandscape ? 64 : 80; // w-16 = 64px, w-20 = 80px
      containerHeight = isMobileLandscape ? 128 : 160; // h-32 = 128px, h-40 = 160px
    } else {
      // Both axes: square/rectangular
      containerWidth = isMobileLandscape ? 128 : 160; // w-32 = 128px, w-40 = 160px
      containerHeight = isMobileLandscape ? 96 : 128; // h-24 = 96px, h-32 = 128px
    }

    const crosshairRadius = 12;

    let x = 50; // Default center
    let y = 50; // Default center

    if (isXSupported && xMax !== xMin) {
      const currentX =
        isDragging && dragPreviewX !== null ? dragPreviewX : ptzX ?? 0;
      const normalizedX = (currentX - xMin) / (xMax - xMin);
      const marginXPercent = (crosshairRadius / containerWidth) * 100;
      x = marginXPercent + normalizedX * (100 - 2 * marginXPercent);
    }

    if (isYSupported && yMax !== yMin) {
      const currentY =
        isDragging && dragPreviewY !== null ? dragPreviewY : ptzY ?? 0;
      const normalizedY = (currentY - yMin) / (yMax - yMin);
      const marginYPercent = (crosshairRadius / containerHeight) * 100;
      y = marginYPercent + (1 - normalizedY) * (100 - 2 * marginYPercent);
    }

    return { x, y };
  };

  const crosshairPosition = getCrosshairPosition();

  // Determine touchpad dimensions and orientation based on supported axes
  const getTouchpadClasses = () => {
    const baseClasses =
      "relative bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg border-2 border-border select-none overflow-hidden transition-all duration-200";
    const interactiveClasses =
      isLoading || isMutationLoading
        ? "cursor-not-allowed blur-sm"
        : isDragging
        ? "cursor-grabbing"
        : "cursor-crosshair hover:border-primary/50 hover:shadow-md";
    const dragClasses =
      isDragging && !isLoading && !isMutationLoading
        ? "border-primary shadow-lg scale-[1.02]"
        : "";

    // Single axis: make it more rectangular in the direction of movement
    if (isXSupported && !isYSupported) {
      // X-only: wider and shorter
      const sizeClasses = isMobileLandscape ? "w-40 h-16" : "w-48 h-20";
      return cn(baseClasses, interactiveClasses, dragClasses, sizeClasses);
    } else if (!isXSupported && isYSupported) {
      // Y-only: taller and narrower
      const sizeClasses = isMobileLandscape ? "w-16 h-32" : "w-20 h-40";
      return cn(baseClasses, interactiveClasses, dragClasses, sizeClasses);
    } else {
      // Both axes: square/rectangular
      const sizeClasses = isMobileLandscape ? "w-32 h-24" : "w-40 h-32";
      // return cn(baseClasses, interactiveClasses, dragClasses, sizeClasses);
      return cn(baseClasses, interactiveClasses, dragClasses, sizeClasses);
    }
  };

  const getControlIcon = () => {
    if (isXSupported && !isYSupported)
      return <ArrowLeftRight className="w-3 h-3 text-primary-foreground" />;
    if (!isXSupported && isYSupported)
      return <ArrowUpDown className="w-3 h-3 text-primary-foreground" />;
    return <Move className="w-3 h-3 text-primary-foreground" />;
  };

  const getControlLabel = () => {
    if (isXSupported && !isYSupported) return "Pan Control";
    if (!isXSupported && isYSupported) return "Tilt Control";
    return "PTZ Control";
  };

  if (!isXSupported && !isYSupported) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs sm:text-sm">{getControlLabel()}</Label>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCenter}
            disabled={isLoading || isMutationLoading}
            className={cn("h-6 w-6", isMobileLandscape ? "h-5 w-5" : "h-6 w-6")}
            title="Center camera"
          >
            <RotateCcw
              className={cn(
                "h-3 w-3",
                isMobileLandscape ? "h-2.5 w-2.5" : "h-3 w-3"
              )}
            />
            <span className="sr-only">Center position</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading || isMutationLoading}
            className={cn("h-6 w-6", isMobileLandscape ? "h-5 w-5" : "h-6 w-6")}
          >
            <RefreshCw
              className={cn(
                "h-3 w-3",
                isMobileLandscape ? "h-2.5 w-2.5" : "h-3 w-3",
                (isLoading || isMutationLoading) && "animate-spin"
              )}
            />
            <span className="sr-only">Refresh position</span>
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          ref={touchpadRef}
          className={getTouchpadClasses()}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-10">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-muted-foreground/20" />
            ))}
          </div>

          {(isLoading || isMutationLoading || isDragging) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs text-muted-foreground font-medium z-90">
                {isDragging ? "Drag to position..." : !isLoading && "Moving..."}
              </div>
            </div>
          )}

          {!isMutationLoading && !isLoading && (
            <div
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${crosshairPosition.x}%`,
                top: `${crosshairPosition.y}%`,
              }}
            >
              <div className="relative">
                <motion.div
                  className="w-6 h-6 rounded-full bg-primary shadow-lg border-2 border-background"
                  animate={{
                    boxShadow:
                      isDragging && !isLoading && !isMutationLoading
                        ? "0 8px 25px -5px rgba(var(--primary), 0.4)"
                        : "0 4px 15px -3px rgba(var(--primary), 0.2)",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {isLoading || isMutationLoading ? (
                    <RefreshCw className="w-3 h-3 text-primary-foreground animate-spin" />
                  ) : (
                    getControlIcon()
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "space-y-3 relative",
          (isLoading || isMutationLoading) && "opacity-60"
        )}
      >
        {isXSupported && ptzX !== undefined && (
          <AxisControl
            value={isDragging && dragPreviewX !== null ? dragPreviewX : ptzX}
            min={xMin}
            max={xMax}
            step={1}
            onChange={setPtzX}
            isLoading={isLoading || isMutationLoading || isDragging}
            label="X Position"
          />
        )}

        {isYSupported && ptzY !== undefined && (
          <AxisControl
            value={isDragging && dragPreviewY !== null ? dragPreviewY : ptzY}
            min={yMin}
            max={yMax}
            step={1}
            onChange={setPtzY}
            isLoading={isLoading || isMutationLoading || isDragging}
            label="Y Position"
          />
        )}
      </div>
    </div>
  );
}
