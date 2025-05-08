import { useIsMediaSupported } from "@/hooks/use-support-media";
import { Navigate, useParams } from "react-router";

export const RerouteHome = () => {
  const { device: deviceId } = useParams();
  const isMediaSupported = useIsMediaSupported(deviceId ?? "");
  return <Navigate to={isMediaSupported ? "stream" : "actions"} replace />;
};
