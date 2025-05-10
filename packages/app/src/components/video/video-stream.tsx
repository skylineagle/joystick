import { ModernVideoLoading } from "@/components/modern-video-loading";
import { Button } from "@/components/ui/button";
import { urls } from "@/lib/urls";
import {
  FullscreenIcon,
  MinimizeIcon,
  Radar,
  RefreshCcwIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import useInterval from "react-useinterval";
import {
  CHECK_STREAM_TIMER_MS,
  STREAM_OFF_INDICATION_SEC,
  VIDEO_ID,
} from "./consts";
import { WHEPClient } from "./mediamtx-webrtc";
import type { StreamingState } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface VideoStreamProps {
  deviceName: string;
}

const MOTIONCELLS_API_URL = "http://lab:7070/api/motioncells";
const MOTIONCELLS_DEFAULTS = {
  threshold: 0.01,
  sensitivity: 0.5,
  display: true,
  gap: 5,
  gridx: 10,
  gridy: 10,
  minimummotionframes: 1,
  motioncellthickness: 1,
  postallmotion: false,
  postnomotion: 0,
  usealpha: true,
  cellscolor: "255,255,0",
  enabled: true,
};

type MotioncellsProps = typeof MOTIONCELLS_DEFAULTS;

export const VideoStream = ({ deviceName }: VideoStreamProps) => {
  const [streamingState, setStreamingState] = useState<StreamingState>("off");
  const [latestFrameReceivedTime, setLatestFrameReceivedTime] = useState(
    new Date()
  );
  const [firstFrameReceived, setFirstFrameReceived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamingClientRef = useRef<WHEPClient | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMotionPanel, setShowMotionPanel] = useState(false);
  const [formProps, setFormProps] =
    useState<MotioncellsProps>(MOTIONCELLS_DEFAULTS);
  const [motionLoading, setMotionLoading] = useState(false);
  const [motionError, setMotionError] = useState<string | null>(null);
  const [motionSuccess, setMotionSuccess] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const initializeStream = () => {
    setStreamingState("off");
    setFirstFrameReceived(false);
    setIsLoading(true);
    setIsPlaying(false);
    if (streamingClientRef.current) {
      streamingClientRef.current = null;
    }
    const videoElement = document.getElementById(
      `${VIDEO_ID}-${deviceName}`
    ) as HTMLVideoElement | null;
    if (videoElement) {
      streamingClientRef.current = new WHEPClient(
        videoElement,
        urls.stream,
        deviceName,
        window
      );
    }
  };

  useEffect(() => {
    initializeStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceName]);

  useInterval(
    () => {
      if (streamingState !== "off") {
        const currentDate = new Date();
        const differenceInSeconds =
          (currentDate.getTime() - latestFrameReceivedTime.getTime()) / 1000;
        if (differenceInSeconds > STREAM_OFF_INDICATION_SEC) {
          setStreamingState("off");
          setIsPlaying(false);
        }
      }
    },
    streamingState !== "off" && streamingState !== "paused"
      ? CHECK_STREAM_TIMER_MS
      : null
  );

  useInterval(
    () => {
      initializeStream();
    },
    !isPlaying ? 5000 : null
  );

  const handleStreamMessageReceived = useCallback(() => {
    if (!firstFrameReceived) {
      setFirstFrameReceived(true);
      setIsLoading(false);
      return;
    }
    if (streamingState !== "on") setStreamingState("on");
    setLatestFrameReceivedTime(new Date());
  }, [streamingState, firstFrameReceived]);

  const handleRefresh = () => {
    initializeStream();
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleVideoCanPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoError = () => {
    setStreamingState("off");
  };

  const handleVideoPause = () => {
    setStreamingState("paused");
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    setStreamingState("resumed");
    setIsPlaying(true);
  };

  const handleTimeUpdateCapture = () => {
    if (streamingState !== "paused") handleStreamMessageReceived();
  };

  const fetchMotionProps = useCallback(async () => {
    setMotionLoading(true);
    setMotionError(null);
    setMotionSuccess(null);
    try {
      const res = await fetch(MOTIONCELLS_API_URL);
      if (!res.ok) throw new Error("Failed to fetch motioncells properties");
      const data: Partial<MotioncellsProps> = await res.json();
      setFormProps((prev) => ({ ...prev, ...data }));
    } catch (e: unknown) {
      if (e instanceof Error) setMotionError(e.message);
      else setMotionError("Unknown error");
    } finally {
      setMotionLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMotionProps();
  }, [fetchMotionProps]);

  const handleFormChange = <K extends keyof MotioncellsProps>(
    key: K,
    value: MotioncellsProps[K]
  ) => {
    setFormProps((prev) => ({ ...prev, [key]: value }));
    setMotionSuccess(null);
  };

  const handleToggleMotionDetection = async () => {
    const newEnabled = !formProps.enabled;
    setFormProps((prev) => ({ ...prev, enabled: newEnabled }));
    setMotionError(null);
    setMotionSuccess(null);
    setMotionLoading(true);
    try {
      const res = await fetch(MOTIONCELLS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formProps, enabled: newEnabled }),
      });
      if (!res.ok) throw new Error("Failed to update motion detection state");
      setMotionSuccess(
        newEnabled ? "Motion detection enabled" : "Motion detection disabled"
      );
      if (newEnabled) {
        setShowMotionPanel(true);
      } else {
        setShowMotionPanel(false);
      }
    } catch (e: unknown) {
      if (e instanceof Error) setMotionError(e.message);
      else setMotionError("Unknown error");
    } finally {
      setMotionLoading(false);
    }
  };

  const handleSave = async () => {
    setMotionLoading(true);
    setMotionError(null);
    setMotionSuccess(null);
    try {
      const res = await fetch(MOTIONCELLS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formProps),
      });
      if (!res.ok) throw new Error("Failed to update properties");
      setMotionSuccess("Saved");
    } catch (e: unknown) {
      if (e instanceof Error) setMotionError(e.message);
      else setMotionError("Unknown error");
    } finally {
      setMotionLoading(false);
    }
  };

  const handleRefreshPanel = async () => {
    await fetchMotionProps();
    setMotionSuccess(null);
  };

  const handleColorChange = (color: string) => {
    setFormProps((prev) => ({ ...prev, cellscolor: color }));
  };

  const handleToggleMotionPanel = () => {
    setShowMotionPanel((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full rounded-xl"
      tabIndex={0}
      aria-label="Device video stream container"
    >
      <div className="absolute right-3 top-3 z-10 flex space-x-2">
        <Button
          variant={formProps.enabled ? "default" : "outline"}
          className="flex size-8 items-center justify-center rounded-full focus:outline-none focus:ring-2"
          aria-label={
            showMotionPanel
              ? "Close motion detection controls"
              : formProps.enabled
              ? "Open motion detection controls"
              : "Enable motion detection"
          }
          tabIndex={0}
          onClick={handleToggleMotionPanel}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleToggleMotionPanel();
          }}
        >
          <span
            className={`font-bold text-xs ${
              formProps.enabled ? "" : "line-through"
            }`}
          >
            <Radar className="size-4" />
          </span>
        </Button>
        <Button
          variant="outline"
          className="flex size-8 items-center justify-center rounded-full focus:outline-none focus:ring-2"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          tabIndex={0}
          onClick={handleFullscreen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleFullscreen();
          }}
        >
          {isFullscreen ? (
            <MinimizeIcon className="size-5" />
          ) : (
            <FullscreenIcon className="size-5" />
          )}
        </Button>
        <Button
          variant="outline"
          className="flex size-8 items-center justify-center rounded-full focus:outline-none focus:ring-2"
          aria-label="Refresh stream"
          tabIndex={0}
          onClick={handleRefresh}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleRefresh();
          }}
        >
          <RefreshCcwIcon className="size-5" />
        </Button>
      </div>
      {showMotionPanel && (
        <>
          <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Motion Detection Settings</DialogTitle>
                <DialogDescription>
                  Detailed explanation of each setting for motion detection and
                  overlay.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto text-sm">
                <div>
                  <span className="font-semibold">Grid</span>: Number of
                  detection cells horizontally (X) and vertically (Y). Higher
                  values increase detection granularity but may impact
                  performance.
                </div>
                <div>
                  <span className="font-semibold">Sensitivity</span>: How easily
                  motion is detected. Higher values detect smaller movements.
                </div>
                <div>
                  <span className="font-semibold">Threshold</span>: Minimum
                  activity in a cell required to trigger detection. Lower values
                  make detection more permissive.
                </div>
                <div>
                  <span className="font-semibold">Overlay</span>: Show or hide
                  the motion detection overlay on the video stream.
                </div>
                <div>
                  <span className="font-semibold">Color</span>: The color used
                  to highlight detected motion cells.
                </div>
                <div>
                  <span className="font-semibold">Outline</span>: Thickness of
                  the cell outline. Set to -1 to disable the outline.
                </div>
                <div>
                  <span className="font-semibold">Alpha</span>: Enable
                  transparency for the overlay cells.
                </div>
                <div>
                  <span className="font-semibold">Min Frames</span>: Number of
                  consecutive frames with motion before an event is triggered.
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <TooltipProvider>
            <div
              className="absolute left-3 top-3 z-20 w-[340px] max-w-full rounded-xl bg-slate-50/95 p-3 shadow-xl border border-slate-200 flex flex-col gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              tabIndex={0}
              aria-label="Motion detection controls panel"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 rounded-full w-6 h-6 text-base font-bold">
                    MD
                  </span>
                  <span className="font-semibold text-base text-slate-800">
                    Motion Detection
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                    aria-label="Show info about motion detection"
                    tabIndex={0}
                    onClick={() => setShowInfoModal(true)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  className="size-6 p-0 text-slate-500 hover:text-slate-800"
                  aria-label="Close motion detection controls"
                  tabIndex={0}
                  onClick={handleToggleMotionPanel}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleToggleMotionPanel();
                  }}
                >
                  ×
                </Button>
              </div>
              {motionError && (
                <div className="text-red-600 text-xs mb-1">{motionError}</div>
              )}
              {motionSuccess && (
                <div className="text-green-600 text-xs mb-1">
                  {motionSuccess}
                </div>
              )}
              {!formProps.enabled ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <span className="mb-4 text-slate-700 text-sm">
                    Motion detection is off
                  </span>
                  <Button
                    variant="default"
                    className="h-8 px-6 text-sm"
                    aria-label="Enable motion detection"
                    tabIndex={0}
                    onClick={handleToggleMotionDetection}
                    disabled={motionLoading}
                  >
                    Enable Motion Detection
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-2">
                    <Button
                      variant="outline"
                      className="h-7 px-4 text-xs text-red-600 border-red-200 hover:bg-red-50"
                      aria-label="Turn off motion detection"
                      tabIndex={0}
                      onClick={handleToggleMotionDetection}
                      disabled={motionLoading}
                    >
                      Turn Off Motion Detection
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <Label
                      htmlFor="gridx"
                      className="text-slate-600 whitespace-nowrap"
                    >
                      Grid
                    </Label>
                    <Input
                      id="gridx"
                      type="number"
                      min={1}
                      max={100}
                      value={formProps.gridx}
                      onChange={(e) =>
                        handleFormChange("gridx", parseInt(e.target.value))
                      }
                      className="w-12 h-7 px-2 py-0.5 text-xs"
                      aria-label="Grid columns"
                      tabIndex={0}
                      disabled={motionLoading}
                    />
                    <span className="text-slate-400">×</span>
                    <Input
                      id="gridy"
                      type="number"
                      min={1}
                      max={100}
                      value={formProps.gridy}
                      onChange={(e) =>
                        handleFormChange("gridy", parseInt(e.target.value))
                      }
                      className="w-12 h-7 px-2 py-0.5 text-xs"
                      aria-label="Grid rows"
                      tabIndex={0}
                      disabled={motionLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="sensitivity" className="text-slate-600">
                      Sensitivity
                    </Label>
                    <Slider
                      id="sensitivity"
                      min={0.1}
                      max={1}
                      step={0.01}
                      value={[formProps.sensitivity]}
                      onValueChange={([v]) =>
                        handleFormChange("sensitivity", v)
                      }
                      className="w-full"
                      aria-label="Motion sensitivity"
                      disabled={motionLoading}
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Low</span>
                      <span>{formProps.sensitivity.toFixed(2)}</span>
                      <span>High</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="threshold" className="text-slate-600">
                      Threshold
                    </Label>
                    <Slider
                      id="threshold"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[formProps.threshold]}
                      onValueChange={([v]) => handleFormChange("threshold", v)}
                      className="w-full"
                      aria-label="Activity threshold"
                      disabled={motionLoading}
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>0%</span>
                      <span>{Math.round(formProps.threshold * 100)}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="display-overlay" className="text-slate-600">
                      Overlay
                    </Label>
                    <Switch
                      id="display-overlay"
                      checked={formProps.display}
                      onCheckedChange={(v) => handleFormChange("display", v)}
                      aria-label="Show overlay"
                      tabIndex={0}
                      disabled={motionLoading}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="cell-highlight-color"
                      className="text-slate-600"
                    >
                      Color
                    </Label>
                    <Input
                      id="cell-highlight-color"
                      type="color"
                      value={`#${formProps.cellscolor
                        .split(",")
                        .map((v) => (+v).toString(16).padStart(2, "0"))
                        .join("")}`}
                      onChange={(e) => {
                        const hex = e.target.value;
                        const rgb = [
                          parseInt(hex.slice(1, 3), 16),
                          parseInt(hex.slice(3, 5), 16),
                          parseInt(hex.slice(5, 7), 16),
                        ].join(",");
                        handleColorChange(rgb);
                      }}
                      className="w-8 h-6 p-0 border-none bg-transparent"
                      aria-label="Cell highlight color"
                      tabIndex={0}
                      disabled={motionLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="motioncellthickness"
                      className="text-slate-600"
                    >
                      Outline
                    </Label>
                    <Slider
                      id="motioncellthickness"
                      min={-1}
                      max={10}
                      step={1}
                      value={[formProps.motioncellthickness]}
                      onValueChange={([v]) =>
                        handleFormChange("motioncellthickness", v)
                      }
                      className="w-full"
                      aria-label="Outline thickness"
                      disabled={motionLoading}
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>None</span>
                      <span>{formProps.motioncellthickness}</span>
                      <span>Thick</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="usealpha" className="text-slate-600">
                      Alpha
                    </Label>
                    <Switch
                      id="usealpha"
                      checked={formProps.usealpha}
                      onCheckedChange={(v) => handleFormChange("usealpha", v)}
                      aria-label="Use transparency"
                      tabIndex={0}
                      disabled={motionLoading}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="min-frames" className="text-slate-600">
                      Min Frames
                    </Label>
                    <Input
                      id="min-frames"
                      type="number"
                      min={1}
                      max={10}
                      value={formProps.minimummotionframes}
                      onChange={(e) =>
                        handleFormChange(
                          "minimummotionframes",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-12 h-7 px-2 py-0.5 text-xs"
                      aria-label="Min frames for event"
                      tabIndex={0}
                      disabled={motionLoading}
                    />
                  </div>
                  <div className="flex gap-1 mt-2">
                    <Button
                      variant="default"
                      className="flex-1 h-7 text-xs"
                      aria-label="Save motion detection settings"
                      tabIndex={0}
                      onClick={handleSave}
                      disabled={motionLoading}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      aria-label="Refresh motion detection settings"
                      tabIndex={0}
                      onClick={handleRefreshPanel}
                      disabled={motionLoading}
                    >
                      Refresh
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1 h-7 text-xs"
                      aria-label="Reset motion detection settings to defaults"
                      tabIndex={0}
                      onClick={() => setFormProps(MOTIONCELLS_DEFAULTS)}
                      disabled={motionLoading}
                    >
                      Reset
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TooltipProvider>
        </>
      )}
      {(isLoading || !isPlaying) && <ModernVideoLoading />}
      <video
        ref={videoRef}
        autoPlay
        muted
        onCanPlay={handleVideoCanPlay}
        playsInline
        controls={false}
        id={`${VIDEO_ID}-${deviceName}`}
        className="size-full rounded-xl shadow-xl bg-black/60"
        tabIndex={0}
        aria-label="Device video stream"
        onError={handleVideoError}
        onPause={handleVideoPause}
        onPlay={handleVideoPlay}
        onTimeUpdateCapture={handleTimeUpdateCapture}
      />
    </div>
  );
};
