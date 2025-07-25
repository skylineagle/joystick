import { useAuthStore } from "@/lib/auth";
import { MessageResponse, UsersRecord } from "@/types/db.types";
import { motion } from "framer-motion";
import { Clock, User } from "lucide-react";
import { FC, memo, useEffect, useMemo, useRef } from "react";
import { pb } from "@/lib/pocketbase";
import { useMutation } from "@tanstack/react-query";

type MessageWithSeen = MessageResponse<{ user: UsersRecord }> & {
  seenAt?: string;
};

interface MessageProps {
  message: MessageWithSeen;
  deviceName?: string;
  formatMessageTime: (dateString: string) => string;
  getMessageStatus: (message: MessageWithSeen) => React.ReactNode;
}

export const Message: FC<MessageProps> = memo(
  ({ message, deviceName, formatMessageTime, getMessageStatus }) => {
    const { user } = useAuthStore();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isMessageSeen = useMemo(
      () => user?.id && message.seen?.includes(user?.id),
      [message.seen, user?.id]
    );

    const { mutate: markMessageAsSeenMutation } = useMutation({
      mutationFn: async (messageId: string) => {
        await pb.collection("message").update(messageId, {
          "seen+": user?.id,
        });
      },
    });

    useEffect(() => {
      if (!isMessageSeen && markMessageAsSeenMutation) {
        timerRef.current = setTimeout(() => {
          markMessageAsSeenMutation(message.id);
        }, 1000);
      }

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, [message.id, isMessageSeen, markMessageAsSeenMutation]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={`flex ${
          message.direction === "from" ? "justify-end" : "justify-start"
        }`}
      >
        <div className="max-w-xs lg:max-w-md">
          <div className="flex items-center space-x-2 mb-1">
            {message.direction === "from" && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{deviceName || "Device"}</span>
              </div>
            )}
            {message.direction === "to" && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{message.expand?.user?.name}</span>
              </div>
            )}
          </div>

          <div
            className={`relative group ${
              message.direction === "from" ? "ml-auto" : "mr-auto"
            }`}
          >
            <div
              className={`px-4 py-3 rounded-2xl text-sm shadow-lg transition-all duration-200 hover:shadow-xl ${
                message.direction === "from"
                  ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-br-md"
                  : "bg-gradient-to-r from-muted to-muted/80 text-foreground rounded-bl-md border border-border/50"
              } ${
                !isMessageSeen && message.direction === "to"
                  ? "ring-2 ring-blue-500/30"
                  : ""
              }`}
              tabIndex={0}
              aria-label={`${
                message.direction === "from" ? "Outgoing" : "Incoming"
              } message`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.message}
              </div>

              <div
                className={`flex items-center justify-between mt-2 text-xs ${
                  message.direction === "from"
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatMessageTime(message.created)}</span>
                </div>
                {getMessageStatus(message)}
              </div>
            </div>

            {!isMessageSeen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);
