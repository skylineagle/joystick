import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeviceName } from "@/hooks/use-device-name";
import type { NotificationHistoryItem } from "@/lib/notification-db";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface EmergencyNotificationDialogProps {
  notification: NotificationHistoryItem | null;
  open: boolean;
  onClose: () => void;
}

export const EmergencyNotificationDialog = ({
  notification,
  open,
  onClose,
}: EmergencyNotificationDialogProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const deviceName = useDeviceName(notification?.device);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    }
  }, [open]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 150);
  };

  if (!notification) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "sm:max-w-md border-destructive/50 shadow-2xl transition-all duration-300",
          "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30",
          "animate-in fade-in-0 zoom-in-95 duration-300",
          isVisible && "shadow-red-500/25 shadow-2xl"
        )}
        style={{
          boxShadow: isVisible
            ? "0 0 30px rgba(239, 68, 68, 0.3), 0 0 60px rgba(239, 68, 68, 0.1)"
            : undefined,
        }}
      >
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex items-center gap-3 text-destructive text-xl">
            <div className="relative">
              <AlertTriangle className="h-6 w-6" />
              <div className="absolute inset-0 h-6 w-6 animate-ping">
                <AlertTriangle className="h-6 w-6 opacity-75" />
              </div>
            </div>
            Emergency Alert
          </DialogTitle>
          <DialogDescription className="text-foreground space-y-3">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <h4 className="font-bold text-lg text-destructive mb-2">
                {notification.title}
              </h4>
              <p className="text-sm leading-relaxed text-foreground">
                {notification.message}
              </p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-destructive/20">
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.created).toLocaleString()}
                </p>
                {notification.device && (
                  <p className="text-xs text-muted-foreground">
                    Device: {deviceName || notification.device}
                  </p>
                )}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            onClick={handleClose}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium"
          >
            Acknowledge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
