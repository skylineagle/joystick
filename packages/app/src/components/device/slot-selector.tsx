import { Button } from "@/components/ui/button";
import { updateDevice } from "@/lib/device";
import { cn } from "@/lib/utils";
import { DeviceInformation, DeviceResponse } from "@/types/types";
import { toast } from "@/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface SlotSelectorProps {
  device: DeviceResponse;
}

export const SlotSelector = ({ device }: SlotSelectorProps) => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const activeSlot = device.information?.activeSlot ?? "primary";

  const hasMultipleSlots =
    device.information?.host && device.information?.secondSlotHost;

  if (!hasMultipleSlots) {
    return null;
  }

  const handleSlotChange = async (newSlot: "primary" | "secondary") => {
    if (newSlot === activeSlot || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateDevice({
        id: device.id,
        information: {
          ...(device.information as DeviceInformation),
          activeSlot: newSlot,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success({
        message: "Active connection slot updated",
      });
    } catch (err) {
      toast.error({
        message: `Failed to update slot: ${(err as Error).message}`,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="inline-flex items-center rounded-md border border-input bg-background shadow-sm"
        role="radiogroup"
        aria-label="Connection Slot Selector"
      >
        <Button
          variant="ghost"
          size="sm"
          role="radio"
          aria-checked={activeSlot === "primary"}
          aria-label="Activate Slot 1 (Primary)"
          onClick={() => handleSlotChange("primary")}
          disabled={isUpdating}
          className={cn(
            "h-7 px-3 text-xs font-medium rounded-l-md rounded-r-none border-0 transition-all duration-200 ease-out",
            activeSlot === "primary"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <motion.span
            key={`primary-${activeSlot === "primary"}`}
            initial={{ y: 1, opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            Slot 1
          </motion.span>
        </Button>
        <div className="w-px h-4 bg-border" />
        <Button
          variant="ghost"
          size="sm"
          role="radio"
          aria-checked={activeSlot === "secondary"}
          aria-label="Activate Slot 2 (Secondary)"
          onClick={() => handleSlotChange("secondary")}
          disabled={isUpdating}
          className={cn(
            "h-7 px-3 text-xs font-medium rounded-r-md rounded-l-none border-0 transition-all duration-200 ease-out",
            activeSlot === "secondary"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <motion.span
            key={`secondary-${activeSlot === "secondary"}`}
            initial={{ y: 1, opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            Slot 2
          </motion.span>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};
