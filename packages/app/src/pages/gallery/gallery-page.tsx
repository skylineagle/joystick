import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { urls } from "@/lib/urls";
import { FocusedEvent } from "@/pages/gallery/focused-event";
import { GalleryEvent } from "@/pages/gallery/gallery-event";
import { GalleryStats } from "@/pages/gallery/gallery-stats";
import { useGalleryEvents } from "@/pages/gallery/use-gallery-events";
import { GalleryResponse } from "@/types/db.types";
import { toast } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { Loader2, Settings2 } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

export interface GalleryStats {
  totalEvents: number;
  newEvents: number;
  pulledEvents: number;
  viewedEvents: number;
}

interface GalleryConfig {
  interval: number;
  autoPull: boolean;
}

export default function GalleryPage() {
  const { device: deviceId } = useParams();
  const queryClient = useQueryClient();
  const [scope, animate] = useAnimate();
  const [config, setConfig] = useState<GalleryConfig>({
    interval: 60,
    autoPull: false,
  });
  const [focusedEvent, setFocusedEvent] = useState<string | null>(null);

  // Fetch gallery events
  const { events, isLoading: isLoadingEvents } = useGalleryEvents(deviceId!);

  const { data: isRunning, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["gallery", deviceId, "status"],
    queryFn: async () => {
      const response = await fetch(
        `${urls.studio}/api/gallery/${deviceId}/status`
      );
      if (!response.ok) throw new Error("Failed to fetch gallery status");
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.status === "running";
    },
  });

  // Start gallery service
  const startMutation = useMutation({
    mutationFn: async (config: GalleryConfig) => {
      const response = await fetch(
        `${urls.studio}/api/gallery/${deviceId}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(config),
        }
      );
      if (!response.ok) throw new Error("Failed to start gallery service");
      return response.json();
    },
    onSuccess: () => {
      toast.success({
        message: "Gallery service started",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", deviceId] });
    },
    onError: (error) => {
      toast.error({
        message:
          error instanceof Error
            ? error.message
            : "Failed to start gallery service",
      });
    },
  });

  // Stop gallery service
  const stopMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${urls.studio}/api/gallery/${deviceId}/stop`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Failed to stop gallery service");
      return response.json();
    },
    onSuccess: () => {
      toast.success({
        message: "Gallery service stopped",
      });
      queryClient.invalidateQueries({ queryKey: ["gallery", deviceId] });
    },
    onError: (error) => {
      toast.error({
        message:
          error instanceof Error
            ? error.message
            : "Failed to stop gallery service",
      });
    },
  });

  const handleServiceToggle = (checked: boolean) => {
    if (checked) {
      startMutation.mutate(config);
    } else {
      stopMutation.mutate();
    }
  };

  const handleFocusEvent = async (event: GalleryResponse) => {
    setFocusedEvent(event.id);
    await animate(
      "img",
      { scale: 1.05, opacity: 0.8 },
      { duration: 0.3, ease: "easeOut" }
    );
  };

  if (isLoadingEvents) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="h-8 w-8 animate-spin" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center space-x-6">
          <GalleryStats deviceId={deviceId!} />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isLoadingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Switch
                checked={isRunning}
                onCheckedChange={handleServiceToggle}
                disabled={startMutation.isPending || stopMutation.isPending}
                className="data-[state=checked]:bg-green-600"
              />
            )}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Gallery Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure the gallery service behavior
                  </p>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="interval">Scan interval (seconds)</Label>
                    <Input
                      id="interval"
                      type="number"
                      value={config.interval}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          interval: Number(e.target.value),
                        })
                      }
                      min={30}
                      step={30}
                      className="h-8"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-pull">Auto-pull videos</Label>
                    <Switch
                      id="auto-pull"
                      checked={config.autoPull}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, autoPull: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </motion.div>

      <AnimatePresence>
        <motion.div
          ref={scope}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {events?.map((event, index) => (
            <GalleryEvent
              key={event.id}
              event={event}
              index={index}
              handleFocusEvent={handleFocusEvent}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      <FocusedEvent
        focusedEvent={
          events?.find((event) => event.id === focusedEvent) ?? null
        }
        setFocusedEvent={setFocusedEvent}
      />
    </div>
  );
}
