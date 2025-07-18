import { useTheme } from "@/components/theme-provider";
import { useIsRouteAllowed } from "@/hooks/use-is-route-allowed";
import { useIsSupported } from "@/hooks/use-is-supported";
import { useMessages } from "@/hooks/use-messages";
import { useAuthStore } from "@/lib/auth";
import { pb } from "@/lib/pocketbase";
import { Message } from "@/pages/messages/message";
import { NewMessage } from "@/pages/messages/new-message";
import {
  DevicesResponse,
  MessageResponse,
  UsersRecord,
} from "@/types/db.types";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, CheckCheck, Smartphone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

type MessageWithSeen = MessageResponse<{ user: UsersRecord }> & {
  seenAt?: string;
};

export function MessagesPage() {
  const { user } = useAuthStore();
  const { device: deviceId } = useParams<{ device: string }>();
  const [deviceInfo, setDeviceInfo] = useState<DevicesResponse | null>(null);
  const { isSupported } = useIsSupported(deviceId!, "send-sms");
  const isRoutePermitted = useIsRouteAllowed("message");
  const { designTheme, getActualColorMode } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading } = useMessages(deviceId);

  const isMessageSeen = useCallback(
    (message: MessageWithSeen) => {
      return user?.id && message.seen && message.seen.includes(user?.id);
    },
    [user?.id]
  );

  useEffect(() => {
    const loadDeviceInfo = async () => {
      try {
        const deviceData = await pb.collection("devices").getOne(deviceId!);
        setDeviceInfo(deviceData);
      } catch (err) {
        console.error("Failed to load device info:", err);
      }
    };

    if (deviceId) {
      loadDeviceInfo();
    }
  }, [deviceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageStatus = (message: MessageWithSeen) => {
    if (message.direction === "from") {
      const isSeen = message.seen && message.seen.length > 0;
      if (isSeen) {
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      } else {
        return <Check className="w-3 h-3 text-muted-foreground" />;
      }
    }
    return null;
  };

  const hasNewMessages = messages.some((msg) => !isMessageSeen(msg));

  const getFirstNewMessageIndex = () => {
    return messages.findIndex((msg) => !isMessageSeen(msg));
  };

  if (!isRoutePermitted || !isSupported) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto" />
          <div className="text-lg font-semibold text-muted-foreground">
            {!isRoutePermitted ? "Access Denied" : "Device Not Supported"}
          </div>
          <div className="text-sm text-muted-foreground">
            {!isRoutePermitted
              ? "You don't have permission to access messaging"
              : "This device does not support messaging functionality"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full w-full max-w-4xl mx-auto bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
      data-theme={designTheme}
      data-color-mode={getActualColorMode()}
    >
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {deviceInfo?.name || `Device ${deviceId}`}
            </h2>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div
                className={`w-2 h-2 rounded-full ${
                  isSupported ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span>{isSupported ? "Online" : "Offline"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/20">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <div className="text-sm text-muted-foreground">
                Loading messages...
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isFirstNewMessage =
                  hasNewMessages &&
                  index === getFirstNewMessageIndex() &&
                  index > 0;

                return (
                  <div key={msg.id}>
                    {isFirstNewMessage && (
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="flex items-center justify-center my-6"
                      >
                        <div className="flex items-center space-x-3 w-full max-w-xs">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
                          <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              New Messages
                            </span>
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
                        </div>
                      </motion.div>
                    )}

                    <Message
                      message={msg}
                      deviceName={deviceInfo?.name}
                      formatMessageTime={formatMessageTime}
                      getMessageStatus={getMessageStatus}
                    />
                  </div>
                );
              })}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-background p-4">
        <NewMessage deviceId={deviceId!} />
      </div>
    </div>
  );
}
