import { cn } from "@/lib/utils";

interface CellInfoDisplayProps {
  label: string;
  value: string | number | undefined;
  className?: string;
  layout?: "horizontal" | "vertical";
  valueClassName?: string;
  mono?: boolean;
}

export function CellInfoDisplay({
  label,
  value,
  className,
  layout = "horizontal",
  valueClassName,
  mono = false,
}: CellInfoDisplayProps) {
  const displayValue = value !== undefined ? String(value) : "N/A";

  if (layout === "vertical") {
    return (
      <div className={cn("flex flex-col", className)}>
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("truncate", mono && "font-mono", valueClassName)}>
          {displayValue}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span
        className={cn(
          "text-xs font-medium truncate",
          mono && "font-mono",
          valueClassName
        )}
      >
        {displayValue}
      </span>
    </div>
  );
}
