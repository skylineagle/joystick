import { Button } from "@/components/ui/button";
import { urls } from "@/lib/urls";
import { Pause, Play, RefreshCcw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { WHEPClient } from "../video/mediamtx-webrtc";

interface AudioPlayerProps {
  deviceName: string;
  onPlayingChange?: (isPlaying: boolean) => void;
}

export const AudioPlayer = ({
  deviceName,
  onPlayingChange,
}: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamingClientRef = useRef<WHEPClient | null>(null);

  const initializeStream = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setIsConnected(false);

    if (streamingClientRef.current) {
      streamingClientRef.current.stop();
      streamingClientRef.current = null;
    }

    const audioElement = audioRef.current;
    if (audioElement) {
      try {
        streamingClientRef.current = new WHEPClient(
          audioElement,
          urls.stream,
          deviceName,
          window
        );
      } catch (err) {
        console.error("Error initializing WebRTC client:", err);
        setError("Failed to initialize audio stream");
        setIsLoading(false);
      }
    }
  }, [deviceName]);

  useEffect(() => {
    initializeStream();

    return () => {
      if (streamingClientRef.current) {
        streamingClientRef.current.stop();
      }
    };
  }, [initializeStream]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setIsConnected(true);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlayingChange?.(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPlayingChange?.(false);
    };

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setError("Failed to load audio stream");
      setIsLoading(false);
      setIsPlaying(false);
      setIsConnected(false);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setIsConnected(true);
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, [onPlayingChange]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !isConnected) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.error("Error playing audio:", err);
        setError("Failed to play audio stream");
      });
    }
  };

  const handleMuteToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.muted = false;
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = newVolume;
    setVolume(newVolume);

    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleRefresh = () => {
    initializeStream();
  };

  const getStatusText = () => {
    if (error) return error;
    if (isLoading) return "Connecting...";
    if (!isConnected) return "Disconnected";
    if (isPlaying) return "Playing";
    return "Ready";
  };

  const getStatusColor = () => {
    if (error) return "text-destructive";
    if (isLoading) return "text-muted-foreground";
    if (!isConnected) return "text-muted-foreground";
    if (isPlaying) return "text-green-500";
    return "text-muted-foreground";
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <audio
        ref={audioRef}
        autoPlay
        preload="none"
        className="hidden"
        id={`audio-${deviceName}`}
      />

      <div className="bg-background/95 backdrop-blur-sm rounded-lg p-6 shadow-lg">
        <div className="flex items-center mb-4 justify-end">
          <div className="flex items-center gap-2">
            <div className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              aria-label="Refresh audio stream"
            >
              <RefreshCcw className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePlayPause}
            disabled={isLoading || !!error || !isConnected}
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </Button>

          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMuteToggle}
              disabled={!isConnected}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </Button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              disabled={!isConnected}
              className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              aria-label="Volume control"
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Streaming from: {deviceName}
        </div>
      </div>
    </div>
  );
};
