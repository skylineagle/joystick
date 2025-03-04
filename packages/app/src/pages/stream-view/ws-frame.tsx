import { useEffect, useRef, useState } from "react";
import { TargetImage } from "react-roi";

export interface FrameProps {
  mode: "edit" | "view";
}

export const WsFrame = ({ mode }: FrameProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [frameData, setFrameData] = useState<string>("");

  useEffect(() => {
    const ws = new WebSocket("/api/ws");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type !== "frame") return;

      setFrameData(`data:image/jpeg;base64,${message.payload.data}`);
    };

    return () => {
      ws.close();
    };
  }, []);

  return mode === "edit" ? (
    <TargetImage id="frame" src={frameData} className="size-full rounded-3xl" />
  ) : (
    <img
      className="size-full rounded-3xl"
      id="frame"
      src={frameData}
      draggable={false}
    />
  );
};
