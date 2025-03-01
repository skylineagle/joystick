import { Badge } from "@/components/ui/badge";
import { LiveIndicator } from "@/components/ui/live-indicator";
import { memo } from "react";
import { motion, AnimatePresence } from "motion/react";

interface StatusIndicatorProps {
  status: string;
}

export const StatusIndicator = memo(({ status }: StatusIndicatorProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {status === "on" ? (
          <LiveIndicator size="medium" status="on" />
        ) : status === "waiting" ? (
          <LiveIndicator size="medium" status="waiting" />
        ) : (
          <Badge
            variant="secondary"
            className="min-w-16 items-center justify-center"
          >
            Off
          </Badge>
        )}
      </motion.div>
    </AnimatePresence>
  );
});
