import { useAuthStore } from "@/lib/auth";
import { pb } from "@/lib/pocketbase";
import { useEffect, useState } from "react";

export const useUnreadMessages = (deviceId?: string) => {
  const { user } = useAuthStore();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    if (!deviceId || !user?.id) {
      setUnreadMessageCount(0);

      return;
    }

    const loadMessages = async () => {
      try {
        const unread = await pb.collection("message").getFullList({
          filter: pb.filter("device = {:deviceId} && seen ?!~ {:userId}", {
            deviceId,
            userId: user.id,
          }),
        });

        setUnreadMessageCount(unread.length);
      } catch (error) {
        console.error("Failed to load messages for new message count:", error);
        setUnreadMessageCount(0);
      }
    };

    loadMessages();

    pb.collection("message").subscribe(
      "*",
      (e) => {
        if (e.action === "create") {
          setUnreadMessageCount((prev) => prev + 1);
        } else if (e.action === "update") {
          if (e.record.seen?.includes(user.id)) {
            setUnreadMessageCount((prev) => Math.max(0, prev - 1));
          }
        } else if (e.action === "delete") {
          setUnreadMessageCount((prev) => Math.max(0, prev - 1));
        }
      },
      {
        filter: `device = "${deviceId}"`,
      }
    );

    return () => {
      try {
        pb.collection("message")?.unsubscribe("*");
      } catch {
        // Do nothing
      }
    };
  }, [deviceId, user?.id]);

  return {
    unreadMessageCount,
    hasUnreadMessages: unreadMessageCount > 0,
  };
};
