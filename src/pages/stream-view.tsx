import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Eye, Square, Terminal, Video, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  CommittedRoiProperties,
  RoiContainer,
  RoiList,
  RoiProvider,
  TargetImage,
} from "react-roi";

interface StreamSettings {
  mode: "live" | "vmd" | "cmd";
  bitrate: number;
}

export function StreamView() {
  const wsRef = useRef<WebSocket | null>(null);
  const [frameData, setFrameData] = useState<string>("");
  const [settings, setSettings] = useState<StreamSettings>({
    mode: "live",
    bitrate: 2000,
  });
  const [isDrawingROI, setIsDrawingROI] = useState(false);
  const [roiData, setRoiData] = useState<CommittedRoiProperties<unknown>[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type !== "frame") return;

      // Set the base64 JPEG data directly
      setFrameData(`data:image/jpeg;base64,${message.payload.data}`);
      // ws.close();
    };

    return () => {
      ws.close();
    };
  }, [settings.mode]);

  const handleModeChange = (value: string) => {
    setSettings((prev) => ({ ...prev, mode: value as StreamSettings["mode"] }));
    // Reset ROI when switching modes
    if (value !== "vmd") {
      setRoiData([]);
      setIsDrawingROI(false);
    }
    // Send mode change to the camera
    wsRef.current?.send(JSON.stringify({ type: "mode", value }));
  };

  const handleBitrateChange = (value: number[]) => {
    setSettings((prev) => ({ ...prev, bitrate: value[0] }));
    // Send bitrate change to the camera
    wsRef.current?.send(JSON.stringify({ type: "bitrate", value: value[0] }));
  };

  return (
    <div className="inset-0">
      <div className="flex items-center justify-center p-8">
        <div className="flex gap-6">
          {/* Stream View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Card className="w-[800px] aspect-[4/3] overflow-hidden rounded-2xl border shadow-2xl">
              <div className="relative h-full">
                {/* {settings.mode === "vmd" && isDrawingROI ? ( */}

                {settings.mode === "vmd" ? (
                  <RoiProvider
                    initialConfig={{
                      commitRoiBoxStrategy: "round",
                      mode: "hybrid",
                    }}
                    onAfterDraw={(roi) => {
                      setRoiData((prev) => [...prev, roi]);
                    }}
                    onAfterMove={(selectedRoiId, roi) => {
                      setRoiData((prev) =>
                        prev.map((r) =>
                          r.id === selectedRoiId ? { ...r, ...roi } : r
                        )
                      );
                    }}
                    onAfterResize={(selectedRoiId, roi) => {
                      setRoiData((prev) =>
                        prev.map((r) =>
                          r.id === selectedRoiId ? { ...r, ...roi } : r
                        )
                      );
                    }}
                    onAfterRotate={(selectedRoiId, roi) => {
                      setRoiData((prev) =>
                        prev.map((r) =>
                          r.id === selectedRoiId ? { ...r, ...roi } : r
                        )
                      );
                    }}
                  >
                    <RoiContainer
                      className="size-full"
                      target={
                        <TargetImage
                          className="size-full"
                          id="frame"
                          src={frameData}
                        />
                      }
                    >
                      <RoiList
                        allowRotate
                        getOverlayOpacity={() => 0.8}
                        getStyle={(roi) => ({
                          resizeHandlerColor:
                            roi.action.type !== "idle"
                              ? "rgba(255,255,255,0.5)"
                              : "white",
                          rectAttributes: {
                            fill: "rgba(0,0,0,0.2)",
                          },
                        })}
                      />
                    </RoiContainer>
                  </RoiProvider>
                ) : (
                  <img className="size-full" id="frame" src={frameData} />
                )}

                <AnimatePresence>
                  {settings.mode === "vmd" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-4 right-4 space-y-2"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg transition-all ${
                          isDrawingROI
                            ? "bg-red-500/90 hover:bg-red-500 text-white ring-1 ring-red-500/50"
                            : "bg-green-500/90 hover:bg-green-500 text-white ring-1 ring-green-500/50"
                        }`}
                        onClick={() => {
                          if (isDrawingROI) {
                            setIsDrawingROI(false);
                          } else {
                            setIsDrawingROI(true);
                          }
                        }}
                      >
                        {isDrawingROI ? (
                          <>
                            <XIcon className="w-4 h-4" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Square className="w-4 h-4" />
                            Draw Region
                          </>
                        )}
                      </motion.button>
                      <AnimatePresence>
                        {roiData && (
                          <motion.button
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-800/90 hover:bg-gray-800 text-white shadow-lg ring-1 ring-white/10 transition-all w-full"
                            onClick={() => {
                              setRoiData([]);
                              wsRef.current?.send(
                                JSON.stringify({ type: "roi", value: [] })
                              );
                            }}
                          >
                            <XIcon className="w-4 h-4" />
                            Clear Region
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>

            {/* Bitrate Control - Floating at the bottom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-20 left-1/2 -translate-x-1/2"
            >
              <Card className="w-[400px] p-4 rounded-xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Stream Bitrate
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {settings.bitrate} kbps
                    </span>
                  </div>
                  <Slider
                    value={[settings.bitrate]}
                    onValueChange={handleBitrateChange}
                    min={500}
                    max={8000}
                    step={100}
                    className="flex-1"
                  />
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Floating Toolbar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-2"
          >
            <Card className="p-3 rounded-xl border shadow-lg">
              <div className="flex flex-col gap-2">
                <Button
                  variant={settings.mode === "live" ? "default" : "ghost"}
                  size="lg"
                  onClick={() => handleModeChange("live")}
                  className="group justify-start gap-3 h-12"
                >
                  <Video className="w-5 h-5" />
                  <Label>Live Stream</Label>
                </Button>
                <Button
                  variant={settings.mode === "vmd" ? "default" : "ghost"}
                  size="lg"
                  onClick={() => handleModeChange("vmd")}
                  className=" group justify-start gap-3 h-12"
                >
                  <Eye className="w-5 h-5" />
                  <Label>Motion Detection</Label>
                </Button>
                <Button
                  variant={settings.mode === "cmd" ? "default" : "ghost"}
                  size="lg"
                  onClick={() => handleModeChange("cmd")}
                  className="group justify-start gap-3 h-12"
                >
                  <Terminal className="w-5 h-5" />
                  <Label>Command Mode</Label>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
