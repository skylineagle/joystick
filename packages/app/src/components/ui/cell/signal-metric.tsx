import { cn } from "@/lib/utils";

interface SignalMetricProps {
  value: number | undefined;
  unit: string;
  label: string;
  type?: "rsrp" | "rsrq" | "rssi" | "sinr";
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

  const getQualityInfo = (val: number | undefined, metricType: string) => {
    if (val === undefined)
      return { label: "Unknown", color: "text-muted-foreground" };

    switch (metricType) {
      case "rsrp":
        if (val >= -80)
          return {
            label: "Excellent",
            color: "text-green-600 dark:text-green-400",
          };
        if (val >= -90)
          return {
            label: "Good",
            color: "text-yellow-600 dark:text-yellow-400",
          };
        if (val >= -100)
          return {
            label: "Fair",
            color: "text-orange-600 dark:text-orange-400",
          };
        return { label: "Poor", color: "text-red-600 dark:text-red-400" };

      case "rsrq":
        if (val > -10)
          return {
            label: "Excellent",
            color: "text-green-600 dark:text-green-400",
          };
        if (val > -15)
          return {
            label: "Good",
            color: "text-yellow-600 dark:text-yellow-400",
          };
        if (val > -20)
          return {
            label: "Fair",
            color: "text-orange-600 dark:text-orange-400",
          };
        return { label: "Poor", color: "text-red-600 dark:text-red-400" };

      case "rssi": {
        // Use different thresholds for 2G/3G vs 4G/5G based on Teltonika standards
        const isLTE = technology === "LTE" || technology === "5G";

        if (isLTE) {
          // 4G/5G RSSI thresholds
          if (val > -65)
            return {
              label: "Excellent",
              color: "text-green-600 dark:text-green-400",
            };
          if (val >= -75)
            return {
              label: "Good",
              color: "text-yellow-600 dark:text-yellow-400",
            };
          if (val >= -85)
            return {
              label: "Fair",
              color: "text-orange-600 dark:text-orange-400",
            };
        } else {
          // 2G/3G RSSI thresholds
          if (val >= -70)
            return {
              label: "Excellent",
              color: "text-green-600 dark:text-green-400",
            };
          if (val >= -85)
            return {
              label: "Good",
              color: "text-yellow-600 dark:text-yellow-400",
            };
          if (val >= -100)
            return {
              label: "Fair",
              color: "text-orange-600 dark:text-orange-400",
            };
        }
        return { label: "Poor", color: "text-red-600 dark:text-red-400" };
      }

      case "sinr":
        if (val > 15)
          return {
            label: "Excellent",
            color: "text-green-600 dark:text-green-400",
          };
        if (val >= 10)
          return {
            label: "Good",
            color: "text-yellow-600 dark:text-yellow-400",
          };
        if (val >= 5)
          return {
            label: "Fair",
            color: "text-orange-600 dark:text-orange-400",
          };
        return { label: "Poor", color: "text-red-600 dark:text-red-400" };

      default:
        return { label: "Unknown", color: "text-muted-foreground" };
    }
  };

  const qualityInfo = getQualityInfo(value, type);

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
