import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useApplicationSettings } from "@/hooks/use-application-settings";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";

export function GeneralSettings() {
  const { generalSettings, setGeneralSettings } = useApplicationSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Set loading to false after initial render
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleSave = () => {
    try {
      setIsSaving(true);
      // Save settings happens automatically with useLocalStorage
      // We just need to show a success message
      toast.success({
        message: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error({
        message: "Failed to save settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="healthCheckInterval">
            Health Check Interval (seconds)
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="healthCheckInterval"
              min={5}
              max={300}
              step={5}
              value={[generalSettings.healthCheckInterval]}
              onValueChange={(value) =>
                setGeneralSettings({
                  ...generalSettings,
                  healthCheckInterval: value[0],
                })
              }
              className="flex-1"
            />
            <Input
              type="number"
              value={generalSettings.healthCheckInterval}
              onChange={(e) =>
                setGeneralSettings({
                  ...generalSettings,
                  healthCheckInterval: Number(e.target.value),
                })
              }
              className="w-20"
              min={5}
              max={300}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            How often to check device connectivity
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="healthcheckTimeout">Device Timeout (seconds)</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="healthcheckTimeout"
              min={10}
              max={300}
              step={5}
              value={[generalSettings.healthcheckTimeout]}
              onValueChange={(value) =>
                setGeneralSettings({
                  ...generalSettings,
                  healthcheckTimeout: value[0],
                })
              }
              className="flex-1"
            />
            <Input
              type="number"
              value={generalSettings.healthcheckTimeout}
              onChange={(e) =>
                setGeneralSettings({
                  ...generalSettings,
                  healthcheckTimeout: Number(e.target.value),
                })
              }
              className="w-20"
              min={10}
              max={300}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Time to wait before considering a device offline
          </p>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full sm:w-auto"
      >
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Settings
      </Button>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>These settings are applied immediately after saving.</p>
        <p className="text-xs">
          The health check interval and auto refresh settings are used
          throughout the application.
        </p>
      </div>
    </div>
  );
}
