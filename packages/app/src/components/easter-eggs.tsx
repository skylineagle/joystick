import { Konami } from "@/konami";
import { GravityEasterEgg } from "./gravity-easter-egg";
import { PirateEasterEgg } from "./pirate-easter-egg";
import { TypewriterEasterEgg } from "./typewriter-easter-egg";
import { BubbleEasterEgg } from "./bubble-easter-egg";
import { useIsPermitted } from "@/hooks/use-is-permitted";

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
    </>
  );
}
