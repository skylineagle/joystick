import { useIsPermitted } from "@/hooks/use-is-permitted";
import { Konami } from "@/konami";
import { BubbleEasterEgg } from "./bubble-easter-egg";
import { GlitchEasterEgg } from "./glitch-easter-egg";
import { GravityEasterEgg } from "./gravity-easter-egg";
import { PirateEasterEgg } from "./pirate-easter-egg";
import { RetroGameEasterEgg } from "./retro-game-easter-egg";
import { TypewriterEasterEgg } from "./typewriter-easter-egg";

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
    </>
  );
}
