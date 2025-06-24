import { EmergencyNotificationDialog } from "@/components/ui/emergency-notification-dialog";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuthStore } from "@/lib/auth";
import type { NotificationHistoryItem } from "@/lib/notification-db";
import { urls } from "@/lib/urls";
import type { WebSocketNotificationMessage } from "@/types/notification";
import { toast } from "@/utils/toast";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

interface NotificationContextType {
  isWebSocketConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  isWebSocketConnected: false,
});

export const useNotificationContext = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const [emergencyNotification, setEmergencyNotification] =
    useState<NotificationHistoryItem | null>(null);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const processedNotifications = useRef(new Set<string>());
  const toastRefs = useRef(new Map<string, string | number>());
  const { token } = useAuthStore();
  const { markAsRead } = useNotifications();

  const wsUrl = urls.joystick.replace(/^http/, "ws") + "/notifications";

  const { lastMessage, readyState } = useWebSocket(token ? wsUrl : null, {
    queryParams: {
      token: token || "",
    },
    shouldReconnect: (closeEvent) => {
      return closeEvent.code !== 1000;
    },
    reconnectAttempts: 3,
    reconnectInterval: (attemptNumber) => {
      return Math.min(Math.pow(2, attemptNumber) * 1000, 5000);
    },
    onError: (error) => {
      console.error("WebSocket error:", error);
    },
  });

  const dismissToast = useCallback((notificationId: string) => {
    const toastId = toastRefs.current.get(notificationId);
    if (toastId) {
      toast.dismiss(toastId);
      toastRefs.current.delete(notificationId);
    }
  }, []);

  const handleShowNotification = useCallback(
    (notification: NotificationHistoryItem) => {
      if (processedNotifications.current.has(notification.id)) {
        return;
      }

      processedNotifications.current.add(notification.id);

      switch (notification.type) {
        case "emergency":
          setEmergencyNotification(notification);
          setShowEmergencyDialog(true);
          break;

        case "error": {
          const errorToastId = toast.error({
            message: notification.message || "",
          });
          toastRefs.current.set(notification.id, errorToastId);
          break;
        }

        case "warning": {
          const warningToastId = toast.warning({
            message: notification.message || "",
          });
          toastRefs.current.set(notification.id, warningToastId);
          break;
        }

        case "success": {
          const successToastId = toast.success({
            message: notification.message || "",
          });
          toastRefs.current.set(notification.id, successToastId);
          setTimeout(() => {
            markAsRead(notification.id);
            dismissToast(notification.id);
          }, 3000);
          break;
        }

        case "info":
        default: {
          const infoToastId = toast.info({
            message: notification.message || "",
          });
          toastRefs.current.set(notification.id, infoToastId);
          setTimeout(() => {
            markAsRead(notification.id);
            dismissToast(notification.id);
          }, 4000);
          break;
        }
      }
    },
    [markAsRead, dismissToast]
  );

  const handleCloseEmergencyDialog = useCallback(() => {
    setShowEmergencyDialog(false);
    if (emergencyNotification) {
      markAsRead(emergencyNotification.id);
    }
    setEmergencyNotification(null);
  }, [emergencyNotification, markAsRead]);

  useEffect(() => {
    const isConnected = readyState === ReadyState.OPEN;
    setIsWebSocketConnected(isConnected);
  }, [readyState]);

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data: WebSocketNotificationMessage = JSON.parse(lastMessage.data);
        if (data.type === "notification") {
          handleShowNotification(data.payload);
        }
      } catch (error) {
        console.error("Failed to parse notification message:", error);
      }
    }
  }, [lastMessage, handleShowNotification]);

  useEffect(() => {
    const currentToastRefs = toastRefs.current;
    const currentProcessedNotifications = processedNotifications.current;
    return () => {
      currentToastRefs.forEach((toastId) => {
        toast.dismiss(toastId);
      });

      currentToastRefs.clear();
      currentProcessedNotifications.clear();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ isWebSocketConnected }}>
      {children}
      <EmergencyNotificationDialog
        notification={emergencyNotification}
        open={showEmergencyDialog}
        onClose={handleCloseEmergencyDialog}
      />
    </NotificationContext.Provider>
  );
};
