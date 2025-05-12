import { useMode } from "@/hooks/use-mode";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useTargetRef } from "react-roi";
import { useQueryState } from "nuqs";
import { parseAsBoolean } from "nuqs/server";

export const RoiMediaFrame = ({
  deviceId,
  deviceName,
  aspectRatio,
  overlayPath,
}: {
  deviceId: string;
  deviceName: string;
  overlayPath?: string;
  aspectRatio?: string;
}) => {
  const { mode } = useMode(deviceId);
  const ref = useTargetRef();
  const [showOverlay] = useQueryState(
    `${deviceId}-overlay`,
    parseAsBoolean.withDefault(true).withOptions({
      shallow: true,
    })
  );

  useEffect(() => {}, [mode]);

  return (
    <div className="relative size-full border-none">
      <div className="relative size-full">
        <iframe
          ref={ref as React.RefObject<HTMLIFrameElement>}
          src={`${urls.stream}/${deviceName}?controls=false&autoPlay=true`}
          className="size-full rounded-xl border-none"
        />
        {overlayPath && showOverlay && (
          <div
            className={cn(
              "absolute self-center inset-0 pointer-events-none",
              aspectRatio
                ? `aspect-[${aspectRatio}]`
                : "size-full aspect-square"
            )}
          >
            <img
              src={overlayPath}
              alt="Stream overlay"
              className={cn(
                "size-full object-contain rounded-xl",
                aspectRatio ? `aspect-[${aspectRatio}]` : "aspect-square"
              )}
            />
          </div>
        )}
      </div>
      <button
        className="absolute top-2 right-14 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white"
        tabIndex={0}
        aria-label="Open stream in new tab"
        onClick={() => {
          window.open(
            `${urls.stream}/${deviceName}?controls=false&autoPlay=true`,
            "_blank",
            "noopener,noreferrer"
          );
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            window.open(
              `${urls.stream}/${deviceName}?controls=false&autoPlay=true`,
              "_blank",
              "noopener,noreferrer"
            );
          }
        }}
        type="button"
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
          <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </button>
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
  aspectRatio,
  overlayPath,
}: {
  deviceId: string;
  deviceName: string;
  aspectRatio?: string;
  overlayPath?: string;
}) => {
  const { mode } = useMode(deviceId);
  const ref = useRef<HTMLIFrameElement>(null);
  const [showOverlay] = useQueryState(
    `${deviceId}-overlay`,
    parseAsBoolean.withDefault(true).withOptions({
      shallow: true,
    })
  );

  useEffect(() => {}, [mode]);

  return (
    <div className="relative size-full border-none">
      <div className="relative size-full">
        <iframe
          ref={ref}
          src={`${urls.stream}/${deviceName}?controls=false&autoPlay=true`}
          className="size-full rounded-xl"
        />
        {overlayPath && showOverlay && (
          <div
            className={cn(
              "absolute self-center inset-0 pointer-events-none",
              aspectRatio
                ? `aspect-[${aspectRatio}]`
                : "size-full aspect-square"
            )}
          >
            <img
              src={overlayPath}
              alt="Stream overlay"
              className={cn(
                "size-full object-contain rounded-xl",
                aspectRatio ? `aspect-[${aspectRatio}]` : "aspect-square"
              )}
            />
          </div>
        )}
      </div>
      <button
        className="absolute top-2 right-14 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white"
        tabIndex={0}
        aria-label="Open stream in new tab"
        onClick={() => {
          window.open(
            `${urls.stream}/${deviceName}?controls=false&autoPlay=true`,
            "_blank",
            "noopener,noreferrer"
          );
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            window.open(
              `${urls.stream}/${deviceName}?controls=false&autoPlay=true`,
              "_blank",
              "noopener,noreferrer"
            );
          }
        }}
        type="button"
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
          <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </button>
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
