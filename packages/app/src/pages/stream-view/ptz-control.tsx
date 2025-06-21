import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { usePtz } from "@/hooks/use-ptz";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
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
  const joystickRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleJoystickMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radius = Math.min(rect.width, rect.height) / 2 - 20;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      let normalizedX = deltaX / radius;
      let normalizedY = -deltaY / radius;

      if (distance > radius) {
        normalizedX = (deltaX / distance) * (radius / radius);
        normalizedY = -(deltaY / distance) * (radius / radius);
      }

      normalizedX = Math.max(-1, Math.min(1, normalizedX));
      normalizedY = Math.max(-1, Math.min(1, normalizedY));

      const newX = xMin + ((normalizedX + 1) / 2) * (xMax - xMin);
      const newY = yMin + ((normalizedY + 1) / 2) * (yMax - yMin);

      setLocalX(Math.round(newX));
      setLocalY(Math.round(newY));
    },
    [xMax, xMin, yMax, yMin]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleJoystickMove(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        handleJoystickMove(e.clientX, e.clientY);
      }
    },
    [isDragging, handleJoystickMove]
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

  const getJoystickPosition = () => {
    const normalizedX = ((localX - xMin) / (xMax - xMin)) * 2 - 1;
    const normalizedY = ((localY - yMin) / (yMax - yMin)) * 2 - 1;

    const x = normalizedX * 40;
    const y = -normalizedY * 40;

    return { x, y };
  };

  const joystickPosition = getJoystickPosition();

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs sm:text-sm">PTZ Control</Label>
        <div className="flex gap-1">
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
          ref={containerRef}
          className={cn(
            "relative bg-muted/50 rounded-full border-2 border-border cursor-crosshair select-none",
            isMobileLandscape ? "w-20 h-20" : "w-24 h-24"
          )}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-2 rounded-full border border-muted-foreground/20" />

          <motion.div
            ref={joystickRef}
            className="absolute w-4 h-4 bg-primary rounded-full shadow-lg cursor-grab active:cursor-grabbing"
            style={{
              left: "50%",
              top: "50%",
              marginLeft: "-8px",
              marginTop: "-8px",
            }}
            animate={{
              x: joystickPosition.x,
              y: joystickPosition.y,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
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
