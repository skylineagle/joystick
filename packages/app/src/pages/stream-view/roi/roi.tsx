import { JSX } from "react";
import { RoiContainer, RoiList } from "react-roi";
import { useRoiStyleStore } from "@/store/roi-style-store";
import { useDeviceId } from "./roi-provider";

interface RoiProps {
  children: JSX.Element;
  deviceId?: string; // Optional, will use context if not provided
}

export const Roi = ({ children, deviceId: propDeviceId }: RoiProps) => {
  const contextDeviceId = useDeviceId();
  const deviceId = propDeviceId || contextDeviceId;

  const { getRoiStyle } = useRoiStyleStore();

  // Convert border style string to SVG stroke-dasharray
  const getBorderStyleValue = (style: string, width: number) => {
    switch (style) {
      case "dashed":
        return `${width * 3} ${width * 2}`;
      case "dotted":
        return `${width} ${width * 2}`;
      case "double":
        return undefined; // Double is handled separately with two strokes
      default:
        return undefined; // Solid
    }
  };

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
        getStyle={(roi) => {
          const isSelected = roi.action.type !== "idle";
          const style = getRoiStyle(deviceId, roi.id, isSelected);

          const strokeDasharray = getBorderStyleValue(
            style.borderStyle,
            style.borderWidth
          );

          return {
            resizeHandlerColor: isSelected
              ? style.borderColor // Use style's border color for handlers when selected
              : style.borderColor,
            rectAttributes: {
              fill: style.fillColor,
              fillOpacity: style.fillOpacity,
              stroke: style.borderColor,
              strokeWidth: style.borderWidth,
              strokeDasharray,
              // For double border, we'll use a filter to create a double stroke effect
              filter:
                style.borderStyle === "double"
                  ? `url(#double-border-${roi.id})`
                  : undefined,
            },
            containerStyle: {
              pointerEvents: "auto",
            },
            // SVG filter definition for double border
            additionalSvgElements:
              style.borderStyle === "double" ? (
                <defs>
                  <filter
                    id={`double-border-${roi.id}`}
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feMorphology
                      operator="dilate"
                      radius={style.borderWidth}
                      in="SourceAlpha"
                      result="thicken"
                    />
                    <feFlood floodColor={style.borderColor} result="color" />
                    <feComposite
                      in="color"
                      in2="thicken"
                      operator="in"
                      result="colored-border"
                    />
                    <feMorphology
                      operator="dilate"
                      radius={style.borderWidth * 0.5}
                      in="SourceAlpha"
                      result="thicken-inner"
                    />
                    <feComposite
                      in="SourceGraphic"
                      in2="thicken-inner"
                      operator="in"
                      result="inner-fill"
                    />
                    <feMerge>
                      <feMergeNode in="colored-border" />
                      <feMergeNode in="inner-fill" />
                    </feMerge>
                  </filter>
                </defs>
              ) : undefined,
          };
        }}
      />
    </RoiContainer>
  );
};
