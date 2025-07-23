import { AudioPlayer } from "@/components/audio/audio-player";
import { AudioVisualizer } from "@/components/audio/audio-visualizer";
import { useDevice } from "@/hooks/use-device";
import { useIsAudioSupported } from "@/hooks/use-support-audio";
import { useIsRouteAllowed } from "@/hooks/use-is-route-allowed";
import { Music } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";

export function AudioView() {
  const { device: deviceId } = useParams();
  const { data: device } = useDevice(deviceId ?? "");
  const isAudioSupported = useIsAudioSupported(deviceId ?? "");
  const isRouteAllowed = useIsRouteAllowed("audio");
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isAudioSupported) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Music className="size-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">Audio not supported</h2>
          <p className="text-muted-foreground">
            This device does not support audio streaming.
          </p>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Music className="size-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">Device not found</h2>
          <p className="text-muted-foreground">
            The requested device could not be found.
          </p>
        </div>
      </div>
    );
  }

  if (!isRouteAllowed) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Music className="size-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">Access denied</h2>
          <p className="text-muted-foreground">
            You are not allowed to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 space-y-8">
      <div className="text-center mb-8">
        <Music className="size-12 mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-2">{device.name}</h1>
      </div>

      <AudioVisualizer isPlaying={isPlaying} className="mb-8" />

      <div className="w-full max-w-md">
        <AudioPlayer
          deviceName={device.configuration?.name || ""}
          onPlayingChange={setIsPlaying}
        />
      </div>
    </div>
  );
}
