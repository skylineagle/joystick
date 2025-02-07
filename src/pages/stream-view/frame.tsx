import { useEffect, useRef, useState } from "react";
import { TargetImage } from "react-roi";

export interface FrameProps {
  mode: "edit" | "view";
}

export const Frame = ({ mode }: FrameProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [frameData, setFrameData] = useState<string>("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
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

  return (
    <div className="size-full">
      {mode === "edit" ? (
        <TargetImage
          id="frame"
          src={frameData}
          className="size-full rounded-xl"
        />
      ) : (
        <img
          className="size-full rounded-2xl"
          id="frame"
          src={frameData}
          draggable={false}
        />
      )}
    </div>
  );
};
