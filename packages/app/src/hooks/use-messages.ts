import { useAuthStore } from "@/lib/auth";
import { pb } from "@/lib/pocketbase";
import { MessageResponse, UsersRecord } from "@/types/db.types";
import { RecordSubscription } from "pocketbase";
import { useEffect, useState } from "react";

type MessageWithSeen = MessageResponse<{ user: UsersRecord }> & {
  seenAt?: string;
};

export const useMessages = (deviceId?: string) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<MessageWithSeen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const messagesData = await pb
          .collection("message")
          .getFullList<MessageWithSeen>({
            filter: `device = "${deviceId}"`,
            sort: "created",
            expand: "user",
          });

        setMessages(messagesData);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    const listener = (e: RecordSubscription<MessageResponse>) => {
      if (e.action === "create") {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === e.record.id);
          if (exists) return prev;
          const newMessage = e.record as MessageWithSeen;
          return [...prev, newMessage];
        });
      } else if (e.action === "delete") {
        setMessages((prev) => prev.filter((m) => m.id !== e.record.id));
      } else if (e.action === "update") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === e.record.id
              ? ({ ...msg, ...e.record } as MessageWithSeen)
              : msg
          )
        );
      }
    };

    pb.collection("message").subscribe("*", listener, {
      filter: `device = "${deviceId}"`,
      expand: "user",
    });

    return () => {
      try {
        pb.collection("message").unsubscribe("*");
      } catch {
        // Do nothing
      }
    };
  }, [deviceId]);

  const getUnreadCount = () => {
    if (!user?.id) return 0;
    return messages.filter(
      (msg) =>
        msg.direction === "to" && (!msg.seen || !msg.seen.includes(user.id))
    ).length;
  };

  return {
    messages,
    isLoading,
    error,
    getUnreadCount,
    hasUnreadMessages: getUnreadCount() > 0,
  };
};
