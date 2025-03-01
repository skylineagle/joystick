import { Label } from "@radix-ui/react-label";
import type React from "react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

const sizeClasses = {
  small: "w-1.5 h-1.5",
  medium: "w-2 h-2",
  large: "w-2.5 h-2.5",
};

interface LiveIndicatorProps {
  size?: "small" | "medium" | "large";
  status: string;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  size = "medium",
  status,
}) => {
  return (
    <Badge
      variant="default"
      className={cn(
        "space-x-2 items-center",
        status === "on"
          ? "bg-emerald-500 hover:bg-emerald-500"
          : "bg-yellow-500 hover:bg-yellow-500"
      )}
    >
      <div className="flex gap-1">
        {status === "on" ? (
          // Three-dot animation for live status
          [0, 1, 2].map((i) => (
            <div key={i} className={cn("relative", sizeClasses[size])}>
              <div
                className={cn(
                  `absolute inset-0 bg-current rounded-full animate-ping`,
                  i === 0 && "animation-delay-0",
                  i === 1 && "animation-delay-300",
                  i === 2 && "animation-delay-600"
                )}
                style={{
                  animationDelay: `${i * 300}ms`,
                }}
              ></div>
              <div
                className={`relative ${sizeClasses[size]} bg-current rounded-full`}
              ></div>
            </div>
          ))
        ) : (
          <div className={`relative ${sizeClasses[size]}`}>
            <div
              className={`absolute inset-0 bg-current rounded-full animate-ping`}
            ></div>
            <div
              className={`relative ${sizeClasses[size]} bg-current rounded-full`}
            ></div>
          </div>
        )}
      </div>

      <Label className="text-sm">{status === "on" ? "Live" : "Waiting"}</Label>
    </Badge>
  );
};
