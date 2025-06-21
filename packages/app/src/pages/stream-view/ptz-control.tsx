import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { usePtz } from "@/hooks/use-ptz";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RefreshCw, Move, RotateCcw } from "lucide-react";
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
    min: xMin,
    max: xMax,
  } = usePtz(deviceId, "x");
  const {
    ptzValue: ptzY,
    setPtzValue: setPtzY,
    refreshPtzValue: refreshPtzY,
    isLoading: isYLoading,
    min: yMin,
    max: yMax,
  } = usePtz(deviceId, "y");

  const [isDragging, setIsDragging] = useState(false);
  const [localX, setLocalX] = useState(0);
  const [localY, setLocalY] = useState(0);
  const touchpadRef = useRef<HTMLDivElement>(null);

  const isLoading = isXLoading || isYLoading;

  useEffect(() => {
    if (ptzX !== undefined) setLocalX(Number(ptzX));
  }, [ptzX]);

  useEffect(() => {
    if (ptzY !== undefined) setLocalY(Number(ptzY));
  }, [ptzY]);

  const handleRefresh = async () => {
    await Promise.all([refreshPtzX(), refreshPtzY()]);
  };

  const handleCenter = () => {
    const centerX = Math.round((xMin + xMax) / 2);
    const centerY = Math.round((yMin + yMax) / 2);
    setLocalX(centerX);
    setLocalY(centerY);
    setPtzX(centerX);
    setPtzY(centerY);
  };

  const handleTouchpadMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!touchpadRef.current) return;

      const rect = touchpadRef.current.getBoundingClientRect();
      const relativeX = (clientX - rect.left) / rect.width;
      const relativeY = (clientY - rect.top) / rect.height;

      const clampedX = Math.max(0, Math.min(1, relativeX));
      const clampedY = Math.max(0, Math.min(1, relativeY));

      const newX = Math.round(xMin + clampedX * (xMax - xMin));
      const newY = Math.round(yMax - clampedY * (yMax - yMin));

      setLocalX(newX);
      setLocalY(newY);
    },
    [xMax, xMin, yMax, yMin]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleTouchpadMove(e.clientX, e.clientY);
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
    if (isDragging) {
      setIsDragging(false);
      setPtzX(localX);
      setPtzY(localY);
    }
  }, [isDragging, localX, localY, setPtzX, setPtzY]);

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

  const getCrosshairPosition = () => {
    if (xMax === xMin || yMax === yMin) {
      return { x: 50, y: 50 };
    }

    const normalizedX = (localX - xMin) / (xMax - xMin);
    const normalizedY = (localY - yMin) / (yMax - yMin);

    const crosshairRadius = 12;
    const containerWidth = isMobileLandscape ? 128 : 160;
    const containerHeight = isMobileLandscape ? 96 : 128;

    const marginXPercent = (crosshairRadius / containerWidth) * 100;
    const marginYPercent = (crosshairRadius / containerHeight) * 100;

    const x = marginXPercent + normalizedX * (100 - 2 * marginXPercent);
    const y = marginYPercent + (1 - normalizedY) * (100 - 2 * marginYPercent);
    console.log(x, y);
    return { x, y };
  };

  const crosshairPosition = getCrosshairPosition();

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs sm:text-sm">PTZ Control</Label>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCenter}
            disabled={isLoading}
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
            <span className="sr-only">Refresh position</span>
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          ref={touchpadRef}
          className={cn(
            "relative bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg border-2 border-border cursor-crosshair select-none overflow-hidden",
            "transition-all duration-200 hover:border-primary/50 hover:shadow-md",
            isDragging && "border-primary shadow-lg scale-[1.02]",
            isMobileLandscape ? "w-32 h-24" : "w-40 h-32"
          )}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-10">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-muted-foreground/20" />
            ))}
          </div>

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
                  boxShadow: isDragging
                    ? "0 8px 25px -5px rgba(var(--primary), 0.4)"
                    : "0 4px 15px -3px rgba(var(--primary), 0.2)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Move className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">X Position</Label>
            <Input
              type="number"
              value={localX}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= xMin && value <= xMax) {
                  setLocalX(value);
                  setPtzX(value);
                }
              }}
              min={xMin}
              max={xMax}
              className="w-16 h-6 text-xs"
              disabled={isLoading}
            />
          </div>
          <Slider
            value={[localX]}
            onValueChange={([value]) => {
              setLocalX(value);
              setPtzX(value);
            }}
            min={xMin}
            max={xMax}
            step={1}
            className="w-full"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Y Position</Label>
            <Input
              type="number"
              value={localY}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= yMin && value <= yMax) {
                  setLocalY(value);
                  setPtzY(value);
                }
              }}
              min={yMin}
              max={yMax}
              className="w-16 h-6 text-xs"
              disabled={isLoading}
            />
          </div>
          <Slider
            value={[localY]}
            onValueChange={([value]) => {
              setLocalY(value);
              setPtzY(value);
            }}
            min={yMin}
            max={yMax}
            step={1}
            className="w-full"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
