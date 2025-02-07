import { Card } from "@/components/ui/card";
import { useRoiMode } from "@/hooks/use-roi-mode";
import { BitrateControll } from "@/pages/stream-view/bitrate-control";
import { ModeSelect } from "@/pages/stream-view/mode-select";
import { Roi } from "@/pages/stream-view/roi/roi";
import { RoiModeControl } from "@/pages/stream-view/roi/roi-mode-control";
import { motion } from "motion/react";
import { useState } from "react";
import { CommittedRoiProperties, RoiProvider } from "react-roi";
import { Frame } from "./frame";

export function StreamView() {
  const [mode, setMode] = useState<"live" | "vmd" | "cmd">("live");
  const [bitrate, setBitrate] = useState(2000);
  const { roiMode } = useRoiMode();
  const [roiData, setRoiData] = useState<CommittedRoiProperties<unknown>[]>([]);

  const handleBitrateChange = (value: number) => {
    setBitrate(value);
  };

  return (
    <RoiProvider
      initialConfig={{
        commitRoiBoxStrategy: "exact",
        rois: roiData,
        mode: roiMode === "edit" ? "hybrid" : "select",
      }}
      onAfterDraw={(roi) => {
        setRoiData((prev) => [...prev, roi]);
      }}
      onAfterMove={(selectedRoiId, roi) => {
        setRoiData((prev) =>
          prev.map((r) => (r.id === selectedRoiId ? { ...r, ...roi } : r))
        );
      }}
      onAfterResize={(selectedRoiId, roi) => {
        setRoiData((prev) =>
          prev.map((r) => (r.id === selectedRoiId ? { ...r, ...roi } : r))
        );
      }}
      onAfterRotate={(selectedRoiId, roi) => {
        setRoiData((prev) =>
          prev.map((r) => (r.id === selectedRoiId ? { ...r, ...roi } : r))
        );
      }}
    >
      <div className="inset-0">
        <div className="flex items-center justify-center p-8">
          <div className="flex gap-6 w-[800px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="size-full flex flex-col gap-6"
            >
              <Card className="size-full rounded-2xl shadow-2xl">
                {roiMode === "hide" ? <Frame mode="view" /> : <Roi />}
              </Card>

              <div className="size-full flex justify-between gap-4">
                <RoiModeControl />
                <BitrateControll
                  bitrate={bitrate}
                  handleBitrateChange={handleBitrateChange}
                />
              </div>
            </motion.div>

            <ModeSelect mode={mode} setMode={setMode} />
          </div>
        </div>
      </div>
    </RoiProvider>
  );
}
