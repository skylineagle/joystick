import { useTheme } from "@/components/theme-provider";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { CSSProperties, useRef } from "react";
import homeDark from "./home.dark.json";
import homeLight from "./home.light.json";
import sendDark from "./send.dark.json";
import sendLight from "./send.light.json";
import settingsDark from "./settings.dark.json";
import settingsLight from "./settings.light.json";
import videoDark from "./video.dark.json";
import videoLight from "./video.light.json";

const icons = {
  video: { dark: videoLight, light: videoDark },
  settings: { dark: settingsLight, light: settingsDark },
  home: { dark: homeLight, light: homeDark },
  send: { dark: sendLight, light: sendDark },
};

interface IconProps {
  icon: keyof typeof icons;
  style?: CSSProperties;
}

export function Icon({ icon, style }: IconProps) {
  const { theme } = useTheme();
  const ref = useRef<LottieRefCurrentProps>(null);

  return (
    <Lottie
      animationData={icons[icon][(theme as "dark" | "light") ?? "dark"]}
      style={style}
      lottieRef={ref}
      autoplay={false}
      onMouseEnter={() => ref.current?.play()}
      onMouseLeave={() => ref.current?.stop()}
    />
  );
}
