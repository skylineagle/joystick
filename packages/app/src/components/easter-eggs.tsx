import { useIsPermitted } from "@/hooks/use-is-permitted";
import { Konami } from "@/konami";
import { BubbleEasterEgg } from "./easter-eggs/bubble-easter-egg";
import { GlitchEasterEgg } from "./easter-eggs/glitch-easter-egg";
import { GravityEasterEgg } from "./easter-eggs/gravity-easter-egg";
import { JitterEasterEgg } from "./easter-eggs/jitter-easter-egg";
import { MatrixEasterEgg } from "./easter-eggs/matrix-easter-egg";
import { MirrorEasterEgg } from "./easter-eggs/mirror-easter-egg";
import { NeonEasterEgg } from "./easter-eggs/neon-easter-egg";
import { PixelArtEasterEgg } from "./easter-eggs/pixel-art-easter-egg";
import { PirateEasterEgg } from "./easter-eggs/pirate-easter-egg";
import { RainEasterEgg } from "./easter-eggs/rain-easter-egg";
import { RetroGameEasterEgg } from "./easter-eggs/retro-game-easter-egg";
import { SlowMotionEasterEgg } from "./easter-eggs/slow-motion-easter-egg";
import { SparkleEasterEgg } from "./easter-eggs/sparkle-easter-egg";
import { TypewriterEasterEgg } from "./easter-eggs/typewriter-easter-egg";
import { VaporwaveEasterEgg } from "./easter-eggs/vaporwave-easter-egg";
import { ZoomEasterEgg } from "./easter-eggs/zoom-easter-egg";

export function EasterEggs() {
  const isEasterEggsPermitted = useIsPermitted("easter-eggs");

  // Only render Easter eggs if the user has permission
  if (!isEasterEggsPermitted) {
    return null;
  }

  return (
    <>
      <Konami />
      <GravityEasterEgg />
      <PirateEasterEgg />
      <TypewriterEasterEgg />
      <BubbleEasterEgg />
      <RetroGameEasterEgg />
      <GlitchEasterEgg />
      <RainEasterEgg />
      <NeonEasterEgg />
      <SlowMotionEasterEgg />
      <PixelArtEasterEgg />
      <MirrorEasterEgg />
      <MatrixEasterEgg />
      <ZoomEasterEgg />
      <SparkleEasterEgg />
      <JitterEasterEgg />
      <VaporwaveEasterEgg />
    </>
  );
}
