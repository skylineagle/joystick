import { useIsAudioSupported } from "@/hooks/use-support-audio";
import { useIsMediaSupported } from "@/hooks/use-support-media";
import { useIsCellSearchSupported } from "@/hooks/use-support-cell-search";
import { useIsRouteAllowed } from "@/hooks/use-is-route-allowed";
import { Navigate, useParams } from "react-router";

export const RerouteHome = () => {
  const { device: deviceId } = useParams();
  const isAudioSupported = useIsAudioSupported(deviceId ?? "");
  const isMediaSupported = useIsMediaSupported(deviceId ?? "");
  const isCellSearchSupported = useIsCellSearchSupported(deviceId ?? "");
  const isAudioRouteAllowed = useIsRouteAllowed("audio");
  const isMediaRouteAllowed = useIsRouteAllowed("media");
  const isCellSearchRouteAllowed = useIsRouteAllowed("cell-search");

  if (isAudioSupported && isAudioRouteAllowed) {
    return <Navigate to="audio" replace />;
  }

  if (isMediaSupported && isMediaRouteAllowed) {
    return <Navigate to="stream" replace />;
  }

  if (isCellSearchSupported && isCellSearchRouteAllowed) {
    return <Navigate to="cell-search" replace />;
  }

  return <Navigate to="actions" replace />;
};
