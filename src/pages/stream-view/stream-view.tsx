import { useRoiMode } from "@/hooks/use-roi-mode";
import { Roi } from "@/pages/stream-view/roi/roi";
import { Frame } from "./frame";

export function StreamView() {
  const { roiMode } = useRoiMode();

  return roiMode === "hide" ? <Frame mode="view" /> : <Roi />;
}
