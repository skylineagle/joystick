import { useIsMediaSupported } from "@/hooks/use-support-media";
import { useIsCellSearchSupported } from "@/hooks/use-support-cell-search";
import { useIsRouteAllowed } from "@/hooks/use-is-route-allowed";
import { Navigate, useParams } from "react-router";

export const RerouteHome = () => {
  const { device: deviceId } = useParams();
  const isMediaSupported = useIsMediaSupported(deviceId ?? "");
  const isCellSearchSupported = useIsCellSearchSupported(deviceId ?? "");
  const isMediaRouteAllowed = useIsRouteAllowed("media");
  const isCellSearchRouteAllowed = useIsRouteAllowed("cell-search");

  if (isMediaSupported && isMediaRouteAllowed) {
    return <Navigate to="stream" replace />;
  }

  if (isCellSearchSupported && isCellSearchRouteAllowed) {
    return <Navigate to="cell-search" replace />;
  }

  return <Navigate to="actions" replace />;
};
