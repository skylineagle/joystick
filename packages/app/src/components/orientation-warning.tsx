import { RotateCcw } from "lucide-react";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function OrientationWarning() {
  const { isMobile, isLandscape } = useMobileLandscape();

  if (!isMobile || isLandscape) return null;

  return (
    <Alert className="size-fit fixed p-4 bottom-4 left-4 right-4 z-50 flex items-center gap-1 bg-muted/80 backdrop-blur">
      <RotateCcw className="h-4 w-4 animate-spin" />
      <AlertDescription>
        Rotate your device to landscape mode for a better experience
      </AlertDescription>
    </Alert>
  );
}
