import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { CSSProperties, useRef } from "react";

interface IconProps {
  icon: unknown;
  style?: CSSProperties;
}

export function Icon({ icon, style }: IconProps) {
  const ref = useRef<LottieRefCurrentProps>(null);

  return (
    <Lottie
      animationData={icon}
      style={style}
      lottieRef={ref}
      autoplay={false}
      onMouseEnter={() => ref.current?.play()}
      onMouseLeave={() => ref.current?.stop()}
    />
  );
}
