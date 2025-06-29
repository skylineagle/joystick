import {
  SignalBars,
  SignalMetric,
  TechnologyBadge,
} from "@/components/ui/cell";
import { cn } from "@/lib/utils";
import { CPSIResult } from "@/types/types";
import { SignalMetricType } from "@/utils/cell";

interface CellDiffDisplayProps {
  current: CPSIResult;
  saved: CPSIResult;
  currentTimestamp?: string;
  savedTimestamp?: string;
}

interface DiffValueProps {
  label: string;
  currentValue?: string | number;
  savedValue?: string | number;
  unit?: string;
  mono?: boolean;
  layout?: "horizontal" | "vertical";
}

const DiffValue = ({
  label,
  currentValue,
  savedValue,
  unit,
  mono,
  layout = "horizontal",
}: DiffValueProps) => {
  const hasChanged = currentValue !== savedValue;
  const formatValue = (value?: string | number) => {
    if (value === undefined || value === null) return "N/A";
    return typeof value === "number" ? value.toString() : value;
  };

  if (layout === "vertical") {
    return (
      <div className="space-y-1">
        <div className="text-[10px] text-muted-foreground font-medium">
          {label}
        </div>
        <div className="space-y-0.5">
          <div
            className={cn(
              "text-xs",
              mono && "font-mono",
              hasChanged
                ? "text-green-600 dark:text-green-400"
                : "text-foreground"
            )}
          >
            {formatValue(currentValue)}
            {unit && ` ${unit}`}
          </div>
          <div
            className={cn(
              "text-[10px] opacity-60",
              mono && "font-mono",
              hasChanged
                ? "text-red-500 dark:text-red-400 line-through"
                : "text-muted-foreground"
            )}
          >
            {formatValue(savedValue)}
            {unit && ` ${unit}`}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-muted-foreground font-medium truncate">
        {label}
      </span>
      <div className="flex flex-row gap-1 items-end">
        <span
          className={cn(
            "text-xs",
            mono && "font-mono",
            hasChanged
              ? "text-green-600 dark:text-green-400"
              : "text-foreground"
          )}
        >
          {formatValue(currentValue)}
          {unit && ` ${unit}`}
        </span>
        <span
          className={cn(
            "text-[10px] opacity-60",
            mono && "font-mono",
            hasChanged
              ? "text-red-500 dark:text-red-400 line-through"
              : "text-muted-foreground"
          )}
        >
          {formatValue(savedValue)}
          {unit && ` ${unit}`}
        </span>
      </div>
    </div>
  );
};

interface DiffSignalMetricProps {
  label: string;
  currentValue?: number;
  savedValue?: number;
  unit: string;
  type: SignalMetricType;
  technology?: string;
}

const DiffSignalMetric = ({
  label,
  currentValue,
  savedValue,
  unit,
  type,
  technology,
}: DiffSignalMetricProps) => {
  const hasChanged = currentValue !== savedValue;

  return (
    <div className="space-y-1">
      <div className="text-[10px] text-muted-foreground font-medium">
        {label}
      </div>
      <div className="space-y-0.5">
        <SignalMetric
          value={currentValue}
          unit={unit}
          label=""
          type={type}
          technology={technology}
          className={
            hasChanged ? "text-green-600 dark:text-green-400" : undefined
          }
        />
        <div
          className={cn(
            "text-[10px] font-mono opacity-60",
            hasChanged
              ? "text-red-500 dark:text-red-400 line-through"
              : "text-muted-foreground"
          )}
        >
          {savedValue !== undefined ? `${savedValue} ${unit}` : "N/A"}
        </div>
      </div>
    </div>
  );
};

export const CellDiffDisplay = ({
  current,
  saved,
  currentTimestamp,
  savedTimestamp,
}: CellDiffDisplayProps) => {
  const getSignalValue = (data: CPSIResult) => {
    if (data.technology === "LTE" && data.rsrp !== undefined) {
      return data.rsrp;
    } else if (data.rssi !== undefined) {
      return data.rssi;
    }
    return -120;
  };

  const getCurrentSignalValue = () => getSignalValue(current);
  const getSavedSignalValue = () => getSignalValue(saved);

  const getSignalTypeForData = (data: CPSIResult): SignalMetricType => {
    if (data.technology === "LTE" && data.rsrp !== undefined) {
      return "rsrp";
    } else if (data.rssi !== undefined) {
      return "rssi";
    }
    return "rsrp";
  };

  const getCurrentSignalType = (): SignalMetricType => {
    return getSignalTypeForData(current);
  };

  const getSavedSignalType = (): SignalMetricType => {
    return getSignalTypeForData(saved);
  };

  const technologyChanged = current.technology !== saved.technology;

  return (
    <div className="space-y-3 w-full">
      <div className="text-[10px] text-muted-foreground space-y-1">
        <div>Current: {currentTimestamp || "just now"}</div>
        <div>Saved: {savedTimestamp || "unknown"}</div>
      </div>

      <div className="flex items-center justify-between gap-1 flex-wrap w-full">
        <div className="flex items-center gap-2 min-w-0 truncate">
          <div className="flex flex-col items-center space-y-1">
            <SignalBars
              value={getCurrentSignalValue()}
              technology={current?.technology}
              size="sm"
              type={getCurrentSignalType()}
            />
            <div className="text-[8px] text-green-600 dark:text-green-400">
              Current
            </div>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <SignalBars
              value={getSavedSignalValue()}
              technology={saved?.technology}
              size="sm"
              type={getSavedSignalType()}
              className="opacity-60"
            />
            <div className="text-[8px] text-red-500 dark:text-red-400">
              Saved
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <TechnologyBadge
              technology={current?.technology || "Unknown"}
              showGeneration
              className={
                technologyChanged
                  ? "text-green-600 dark:text-green-400"
                  : undefined
              }
            />
            {technologyChanged && (
              <TechnologyBadge
                technology={saved?.technology || "Unknown"}
                showGeneration
                className="opacity-60 line-through"
              />
            )}
          </div>
        </div>
      </div>

      <DiffValue
        label="Provider"
        layout="horizontal"
        currentValue={current?.operator || "Unknown"}
        savedValue={saved?.operator || "Unknown"}
      />

      <DiffValue
        label="Cell ID"
        currentValue={current?.cellId}
        savedValue={saved?.cellId}
        mono
      />

      <div className="grid grid-cols-2 gap-2 pt-1 text-xs w-full">
        <DiffValue
          label="Band"
          currentValue={current?.band}
          savedValue={saved?.band}
          layout="vertical"
        />

        {current?.technology === "LTE" ? (
          <>
            <DiffSignalMetric
              currentValue={current?.rsrp}
              savedValue={saved?.rsrp}
              unit="dBm"
              label="RSRP"
              type="rsrp"
            />

            <DiffSignalMetric
              currentValue={current?.sinr}
              savedValue={saved?.sinr}
              unit="dB"
              label="SINR"
              type="sinr"
            />

            <DiffSignalMetric
              currentValue={current?.rsrq}
              savedValue={saved?.rsrq}
              unit="dB"
              label="RSRQ"
              type="rsrq"
            />
          </>
        ) : (
          <>
            <DiffSignalMetric
              currentValue={current?.rssi}
              savedValue={saved?.rssi}
              unit="dBm"
              label="RSSI"
              type="rssi"
              technology={current?.technology}
            />

            {current?.technology === "GSM" && (
              <DiffValue
                label="BSIC"
                currentValue={current?.bsic}
                savedValue={saved?.bsic}
                layout="vertical"
              />
            )}

            {current?.technology === "GSM" && (
              <DiffValue
                label="Timing Adv"
                currentValue={current?.timingAdvance}
                savedValue={saved?.timingAdvance}
                layout="vertical"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
