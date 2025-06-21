import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePing } from "@/hooks/use-ping";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { cn } from "@/lib/utils";
import { Activity, Play, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TerminalPingControlProps {
  deviceId: string;
  tabActive?: boolean;
}

interface PingLogEntry {
  id: string;
  timestamp: number;
  success: boolean;
  responseTime?: number;
  error?: string;
}

export const TerminalPingControl = ({
  deviceId,
  tabActive = true,
}: TerminalPingControlProps) => {
  const [isActive, setIsActive] = useState(false);
  const [pingLog, setPingLog] = useState<PingLogEntry[]>([]);
  const { isMobileLandscape } = useMobileLandscape();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { pingResult, isLoading } = usePing(deviceId, isActive, tabActive);

  const handleTogglePing = () => {
    if (isActive) {
      setIsActive(false);
    } else {
      setPingLog([]);
      setIsActive(true);
    }
  };

  useEffect(() => {
    if (!tabActive && isActive) {
      setIsActive(false);
    }
  }, [tabActive, isActive]);

  useEffect(() => {
    if (pingResult && isActive && tabActive) {
      const newEntry: PingLogEntry = {
        id: `${pingResult.timestamp}-${Math.random()}`,
        timestamp: pingResult.timestamp,
        success: pingResult.success,
        responseTime: pingResult.responseTime,
        error: pingResult.error,
      };

      setPingLog((prev) => {
        const updated = [...prev, newEntry];
        return updated.slice(-50);
      });
    }
  }, [pingResult, isActive, tabActive]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [pingLog]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatPingLine = (entry: PingLogEntry) => {
    const time = formatTimestamp(entry.timestamp);
    if (entry.success) {
      return `[${time}]: time=${entry.responseTime}ms`;
    } else {
      return `[${time}]: ${entry.error || "timeout"}`;
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-end gap-2">
        {isActive && tabActive && (
          <Activity
            className={cn(
              "h-3 w-3 text-green-500 animate-pulse",
              isMobileLandscape ? "h-2.5 w-2.5" : "h-3 w-3"
            )}
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTogglePing}
          className={cn(
            "h-6 px-2 text-xs",
            isMobileLandscape ? "h-5 px-1" : "h-6 px-2"
          )}
        >
          {isActive ? (
            <>
              <Square
                className={cn(
                  "h-3 w-3 mr-1",
                  isMobileLandscape ? "h-2.5 w-2.5" : "h-3 w-3"
                )}
              />
              Stop
            </>
          ) : (
            <>
              <Play
                className={cn(
                  "h-3 w-3 mr-1",
                  isMobileLandscape ? "h-2.5 w-2.5" : "h-3 w-3"
                )}
              />
              Start
            </>
          )}
        </Button>
      </div>

      <Card
        className={cn(
          "bg-black/90 border-gray-700 p-2",
          isMobileLandscape ? "h-24" : "h-32"
        )}
      >
        <ScrollArea ref={scrollAreaRef} className="h-full w-full">
          <div className="font-mono text-xs space-y-1">
            {isActive && pingLog.length === 0 && isLoading && (
              <div className="text-yellow-400">
                Starting ping to {deviceId}...
              </div>
            )}
            {pingLog.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "font-mono",
                  entry.success ? "text-green-400" : "text-red-400"
                )}
              >
                {formatPingLine(entry)}
              </div>
            ))}
            {isActive && tabActive && (
              <div className="text-gray-500 animate-pulse">▋</div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};
