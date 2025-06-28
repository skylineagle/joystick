import { cn } from "@/lib/utils";
import { getSignalQuality, SignalMetricType } from "@/utils/cell";

interface SignalMetricProps {
  value: number | undefined;
  unit: string;
  label: string;
  type?: SignalMetricType;
  technology?: string;
  showQuality?: boolean;
  className?: string;
  layout?: "horizontal" | "vertical";
}

export function SignalMetric({
  value,
  unit,
  label,
  type = "rsrp",
  technology,
  showQuality = false,
  className,
  layout = "vertical",
}: SignalMetricProps) {
  const formatValue = (val: number | undefined, unitStr: string) => {
    if (val === undefined) return "N/A";
    return `${val} ${unitStr}`;
  };

  const qualityInfo = getSignalQuality(value, type, technology);

  if (layout === "horizontal") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-xs text-muted-foreground min-w-0">{label}:</span>
        <div className="flex items-center gap-1 min-w-0">
          <span
            className={cn(
              "font-mono text-sm font-medium truncate",
              qualityInfo.color
            )}
          >
            {formatValue(value, unit)}
          </span>
          {showQuality && (
            <span className={cn("text-xs capitalize", qualityInfo.color)}>
              ({qualityInfo.label})
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-col">
        <span
          className={cn(
            "font-mono text-sm font-medium truncate",
            qualityInfo.color
          )}
        >
          {formatValue(value, unit)}
        </span>
        {showQuality && (
          <span className={cn("text-xs capitalize", qualityInfo.color)}>
            {qualityInfo.label}
          </span>
        )}
      </div>
    </div>
  );
}
