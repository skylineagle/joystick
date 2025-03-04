import { Konami } from "@/konami";
import { GravityEasterEgg } from "./gravity-easter-egg";
import { PirateEasterEgg } from "./pirate-easter-egg";
import { TypewriterEasterEgg } from "./typewriter-easter-egg";
import { BubbleEasterEgg } from "./bubble-easter-egg";

export function EasterEggs() {
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
