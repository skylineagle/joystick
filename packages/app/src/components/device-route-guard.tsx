import { useDevice } from "@/hooks/use-device";
import { Navigate, Outlet, useParams } from "react-router";
import { HashLoader } from "react-spinners";
import { motion } from "motion/react";

export function DeviceRouteGuard() {
  const { device: deviceId } = useParams();
  const { data: device, isLoading, error } = useDevice(deviceId ?? "");

  if (isLoading) {
    return (
      <motion.div
        className="flex items-center justify-center h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <HashLoader color="hsl(var(--primary))" size={150} />
        </motion.div>
      </motion.div>
    );
  }

  if (error || !device) {
    return <Navigate to="/not-found" replace />;
  }

  return <Outlet />;
}
