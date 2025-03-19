import { JSX } from "react";
import { RoiContainer, RoiList } from "react-roi";

interface RoiProps {
  children: JSX.Element;
}

export const Roi = ({ children }: RoiProps) => {
  return (
    <RoiContainer
      className="size-full overflow-hidden"
      style={{
        backgroundColor: "transparent",
        position: "absolute",
        inset: 0,
      }}
      target={children}
      lockPan
    >
      <RoiList
        getOverlayOpacity={() => 0.8}
        getStyle={(roi) => ({
          resizeHandlerColor:
            roi.action.type !== "idle" ? "rgba(255,255,255,0.5)" : "white",
          rectAttributes: {
            fill: "rgba(0,0,0,0.2)",
            stroke: "white",
            strokeWidth: 2,
          },
          containerStyle: {
            pointerEvents: "auto",
          },
        })}
      />
    </RoiContainer>
  );
};
