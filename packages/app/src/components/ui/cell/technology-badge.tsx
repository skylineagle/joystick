import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TechnologyBadgeProps {
  technology: string;
  showGeneration?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TechnologyBadge({
  technology,
  showGeneration = false,
  className,
  size = "md",
}: TechnologyBadgeProps) {
  const getTechnologyColors = (tech: string) => {
    const colors = {
      LTE: "bg-chart-1/10 text-chart-1 border-chart-1/20",
      GSM: "bg-chart-3/10 text-chart-3 border-chart-3/20",
      WCDMA: "bg-chart-5/10 text-chart-5 border-chart-5/20",
      "5G": "bg-chart-2/10 text-chart-2 border-chart-2/20",
    };

    return (
      colors[tech as keyof typeof colors] ||
      "bg-muted/10 text-muted-foreground border-muted/20"
    );
  };

  const getGenerationLabel = (tech: string) => {
    if (!tech) return "Unknown";

    const techUpper = tech.toUpperCase();
    if (techUpper === "LTE" || techUpper === "4G") return "4G";
    if (techUpper === "GSM" || techUpper === "2G") return "2G";
    if (techUpper === "WCDMA" || techUpper === "UMTS" || techUpper === "3G")
      return "3G";
    if (techUpper === "5G" || techUpper === "5G NR") return "5G";

    return tech;
  };

  const getGenerationBadgeColor = (label: string) => {
    const genColors = {
      "5G": "bg-chart-1/10 text-chart-1 border-chart-1/20",
      "4G": "bg-chart-2/10 text-chart-2 border-chart-2/20",
      "3G": "bg-chart-4/10 text-chart-4 border-chart-4/20",
      "2G": "bg-destructive/10 text-destructive border-destructive/20",
    };

    return (
      genColors[label as keyof typeof genColors] ||
      "bg-muted/10 text-muted-foreground border-muted/20"
    );
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "text-xs px-1.5 py-0.5";
      case "lg":
        return "text-sm px-3 py-1";
      default:
        return "text-xs px-2 py-0.5";
    }
  };

  const generationLabel = getGenerationLabel(technology);

  if (showGeneration && generationLabel !== technology) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Badge
          variant="outline"
          className={cn(getTechnologyColors(technology), getSizeClass())}
        >
          {technology}
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            getGenerationBadgeColor(generationLabel),
            getSizeClass()
          )}
        >
          {generationLabel}
        </Badge>
      </div>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(getTechnologyColors(technology), getSizeClass(), className)}
    >
      {technology}
    </Badge>
  );
}
