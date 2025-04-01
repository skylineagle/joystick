import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQueryState } from "nuqs";
import { parseAsBoolean } from "nuqs/server";

interface OverlayToggleProps {
  deviceId: string;
}

export function OverlayToggle({ deviceId }: OverlayToggleProps) {
  const [showOverlay, setShowOverlay] = useQueryState(
    "overlay",
    parseAsBoolean.withDefault(true).withOptions({
      shallow: true,
    })
  );

  return (
    <div className="grid grid-cols-2 grid-rows-1 items-center gap-2 mt-2">
      <Label className="text-muted-foreground">Show overlay:</Label>
      <Switch
        id={`overlay-${deviceId}`}
        checked={showOverlay}
        onCheckedChange={setShowOverlay}
        aria-label="Toggle overlay visibility"
      />
    </div>
  );
}
