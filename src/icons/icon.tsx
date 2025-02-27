import { useTheme } from "@/components/theme-provider";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { CSSProperties, useRef } from "react";
import homeDark from "./home.dark.json";
import homeLight from "./home.light.json";
import sendDark from "./send.dark.json";
import sendLight from "./send.light.json";
import settingsDark from "./settings.dark.json";
import settingsLight from "./settings.light.json";
import terminalDark from "./terminal.dark.json";
import terminalLight from "./terminal.light.json";
import videoDark from "./video.dark.json";
import videoLight from "./video.light.json";
import menuDark from "./menu.dark.json";
import menuLight from "./menu.light.json";
import statusDark from "./status.dark.json";
import statusLight from "./status.light.json";

const icons = {
  video: { dark: videoLight, light: videoDark },
  settings: { dark: settingsLight, light: settingsDark },
  home: { dark: homeLight, light: homeDark },
  send: { dark: sendLight, light: sendDark },
  terminal: { dark: terminalLight, light: terminalDark },
  menu: { dark: menuLight, light: menuDark },
  status: { dark: statusLight, light: statusDark },
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
