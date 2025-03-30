import { useMode } from "@/hooks/use-mode";
import { urls } from "@/lib/urls";
import { useEffect, useRef } from "react";
import { useTargetRef } from "react-roi";

export const RoiMediaFrame = ({
  deviceId,
  deviceName,
}: {
  deviceId: string;
  deviceName: string;
}) => {
  const { mode } = useMode(deviceId);
  const ref = useTargetRef();

  useEffect(() => {}, [mode]);

  return (
    <div className="relative size-full border-none">
      <iframe
        ref={ref as React.RefObject<HTMLIFrameElement>}
        src={`${urls.stream}/${deviceName}?controls=false&autoPlay=true`}
        className="size-full rounded-xl border-none"
      />
      <button
        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-10"
        onClick={() => {
          const iframe = ref.current as HTMLIFrameElement;
          if (iframe) {
            // eslint-disable-next-line no-self-assign
            iframe.src = iframe.src;
          }
        }}
        aria-label="Reload stream"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </div>
  );
};

export const MediaFrame = ({
  deviceId,
  deviceName,
}: {
  deviceId: string;
  deviceName: string;
}) => {
  const { mode } = useMode(deviceId);
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {}, [mode]);

  return (
    <div className="relative size-full border-none">
      <iframe
        ref={ref}
        src={`${urls.stream}/${deviceName}?controls=false&autoPlay=true`}
        className="size-full rounded-xl"
      />
      <button
        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
        onClick={() => {
          const iframe = ref.current as HTMLIFrameElement;
          if (iframe) {
            // eslint-disable-next-line no-self-assign
            iframe.src = iframe.src;
          }
        }}
        aria-label="Reload stream"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </div>
  );
};
