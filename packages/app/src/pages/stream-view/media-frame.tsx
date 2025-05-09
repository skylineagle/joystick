import { useMode } from "@/hooks/use-mode";
import { urls } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showOverlay] = useQueryState(
    `${deviceId}-overlay`,
    parseAsBoolean.withDefault(true).withOptions({
      shallow: true,
    })
  );

  useEffect(() => {}, [mode]);

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`
          );
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div ref={containerRef} className="relative size-full border-none">
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
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button
          className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          onClick={handleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          tabIndex={0}
        >
          {isFullscreen ? (
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
              <path d="M8 3v4a1 1 0 0 1-1 1H3" />
              <path d="M21 8h-4a1 1 0 0 1-1-1V3" />
              <path d="M3 16h4a1 1 0 0 1 1 1v4" />
              <path d="M16 21v-4a1 1 0 0 1 1-1h4" />
            </svg>
          ) : (
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
              <path d="M3 8V5a2 2 0 0 1 2-2h3" />
              <path d="M16 3h3a2 2 0 0 1 2 2v3" />
              <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
              <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
            </svg>
          )}
        </button>
        <button
          className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          onClick={() => {
            const iframe = ref.current as HTMLIFrameElement;
            if (iframe) {
              // eslint-disable-next-line no-self-assign
              iframe.src = iframe.src;
            }
          }}
          aria-label="Reload stream"
          tabIndex={0}
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showOverlay] = useQueryState(
    `${deviceId}-overlay`,
    parseAsBoolean.withDefault(true).withOptions({
      shallow: true,
    })
  );

  useEffect(() => {}, [mode]);

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`
          );
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div ref={containerRef} className="relative size-full border-none">
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

      <div className="absolute top-2 right-2 flex gap-2">
        <button
          className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          onClick={handleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          tabIndex={0}
        >
          {isFullscreen ? (
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
              <path d="M8 3v4a1 1 0 0 1-1 1H3" />
              <path d="M21 8h-4a1 1 0 0 1-1-1V3" />
              <path d="M3 16h4a1 1 0 0 1 1 1v4" />
              <path d="M16 21v-4a1 1 0 0 1 1-1h4" />
            </svg>
          ) : (
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
              <path d="M3 8V5a2 2 0 0 1 2-2h3" />
              <path d="M16 3h3a2 2 0 0 1 2 2v3" />
              <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
              <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
            </svg>
          )}
        </button>
        <button
          className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          onClick={() => {
            const iframe = ref.current as HTMLIFrameElement;
            if (iframe) {
              // eslint-disable-next-line no-self-assign
              iframe.src = iframe.src;
            }
          }}
          aria-label="Reload stream"
          tabIndex={0}
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
    </div>
  );
};
