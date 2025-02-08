import { Frame } from "@/pages/stream-view/frame";
import { RoiContainer, RoiList } from "react-roi";

export const Roi = () => {
  return (
    <RoiContainer
      className="size-full overflow-hidden rounded-3xl"
      style={{ backgroundColor: "transparent" }}
      target={<Frame mode="edit" />}
      lockPan
    >
      <RoiList
        allowRotate
        getOverlayOpacity={() => 0.8}
        getStyle={(roi) => ({
          resizeHandlerColor:
            roi.action.type !== "idle" ? "rgba(255,255,255,0.5)" : "white",
          rectAttributes: {
            fill: "rgba(0,0,0,0.2)",
            stroke: "white",
            strokeWidth: 2,
          },
        })}
      />
    </RoiContainer>
  );
};
