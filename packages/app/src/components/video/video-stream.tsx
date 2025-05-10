import { ModernVideoLoading } from "@/components/modern-video-loading";
import { Button } from "@/components/ui/button";
import { urls } from "@/lib/urls";
import { FullscreenIcon, MinimizeIcon, RefreshCcwIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import useInterval from "react-useinterval";
import {
  CHECK_STREAM_TIMER_MS,
  STREAM_OFF_INDICATION_SEC,
  VIDEO_ID,
} from "./consts";
import { WHEPClient } from "./mediamtx-webrtc";
import type { StreamingState } from "./types";

interface VideoStreamProps {
  deviceName: string;
}

export const VideoStream = ({ deviceName }: VideoStreamProps) => {
  const [streamingState, setStreamingState] = useState<StreamingState>("off");
  const [latestFrameReceivedTime, setLatestFrameReceivedTime] = useState(
    new Date()
  );
  const [firstFrameReceived, setFirstFrameReceived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamingClientRef = useRef<WHEPClient | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const initializeStream = () => {
    setStreamingState("off");
    setFirstFrameReceived(false);
    setIsLoading(true);
    setIsPlaying(false);
    if (streamingClientRef.current) {
      streamingClientRef.current = null;
    }
    const videoElement = document.getElementById(
      `${VIDEO_ID}-${deviceName}`
    ) as HTMLVideoElement | null;
    if (videoElement) {
      streamingClientRef.current = new WHEPClient(
        videoElement,
        urls.stream,
        deviceName,
        window
      );
    }
  };

  useEffect(() => {
    initializeStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceName]);

  useInterval(
    () => {
      if (streamingState !== "off") {
        const currentDate = new Date();
        const differenceInSeconds =
          (currentDate.getTime() - latestFrameReceivedTime.getTime()) / 1000;
        if (differenceInSeconds > STREAM_OFF_INDICATION_SEC) {
          setStreamingState("off");
          setIsPlaying(false);
        }
      }
    },
    streamingState !== "off" && streamingState !== "paused"
      ? CHECK_STREAM_TIMER_MS
      : null
  );

  useInterval(
    () => {
      initializeStream();
    },
    !isPlaying ? 5000 : null
  );

  const handleStreamMessageReceived = useCallback(() => {
    if (!firstFrameReceived) {
      setFirstFrameReceived(true);
      setIsLoading(false);
      return;
    }
    if (streamingState !== "on") setStreamingState("on");
    setLatestFrameReceivedTime(new Date());
  }, [streamingState, firstFrameReceived]);

  const handleRefresh = () => {
    initializeStream();
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleVideoCanPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoError = () => {
    setStreamingState("off");
  };

  const handleVideoPause = () => {
    setStreamingState("paused");
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    setStreamingState("resumed");
    setIsPlaying(true);
  };

  const handleTimeUpdateCapture = () => {
    if (streamingState !== "paused") handleStreamMessageReceived();
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full rounded-xl"
      tabIndex={0}
      aria-label="Device video stream container"
    >
      <div className="absolute right-3 top-3 z-10 flex space-x-2">
        <Button
          variant="outline"
          className="flex size-8 items-center justify-center rounded-full focus:outline-none focus:ring-2"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          tabIndex={0}
          onClick={handleFullscreen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleFullscreen();
          }}
        >
          {isFullscreen ? (
            <MinimizeIcon className="size-5" />
          ) : (
            <FullscreenIcon className="size-5" />
          )}
        </Button>
        <Button
          variant="outline"
          className="flex size-8 items-center justify-center rounded-full focus:outline-none focus:ring-2"
          aria-label="Refresh stream"
          tabIndex={0}
          onClick={handleRefresh}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleRefresh();
          }}
        >
          <RefreshCcwIcon className="size-5" />
        </Button>
      </div>
      {(isLoading || !isPlaying) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ModernVideoLoading />
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        onCanPlay={handleVideoCanPlay}
        playsInline
        controls={false}
        id={`${VIDEO_ID}-${deviceName}`}
        className="size-full rounded-xl shadow-xl bg-black/60"
        tabIndex={0}
        aria-label="Device video stream"
        onError={handleVideoError}
        onPause={handleVideoPause}
        onPlay={handleVideoPlay}
        onTimeUpdateCapture={handleTimeUpdateCapture}
      />
    </div>
  );
};
