import { joystickApi } from "@/lib/api-client";
import { urls } from "@/lib/urls";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "@/utils/toast";

interface NewMessageProps {
  deviceId: string;
}

export const NewMessage = ({ deviceId }: NewMessageProps) => {
  const [input, setInput] = useState("");
  const { mutate: sendMessageMutation, isPending } = useMutation({
    mutationFn: async () => {
      const result = await joystickApi.post<{
        success: boolean;
        output: string;
      }>(`${urls.joystick}/api/run/${deviceId}/send-sms`, {
        message: input,
      });

      try {
        if (!result.success) {
          const output: {
            success: boolean;
            error?: string;
            message?: string;
          } = JSON.parse(result?.output || "{}");
          console.log(result);

          if (!result.success && !output.success) {
            toast.error({
              message:
                output.error || output.message || "Failed to send message",
            });
            return;
          }
        }
      } catch {
        toast.error({
          message: "Failed to send message",
        });
      }

      return result;
    },
    onSuccess: () => {
      setInput("");
    },
  });
  const handleSendMessage = () => {
    if (!input.trim() || isPending) return;
    sendMessageMutation();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <form
        className="flex items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        role="search"
        aria-label="Send message"
      >
        <div className="flex-1 relative">
          <textarea
            className="w-full px-4 py-3 rounded-2xl border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none min-h-[44px] max-h-32"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            aria-label="Message input"
            disabled={isPending}
            rows={1}
            style={{
              height: "auto",
              minHeight: "44px",
              maxHeight: "128px",
            }}
          />
        </div>
        <motion.button
          type="submit"
          className="p-3 rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg"
          disabled={isPending || !input.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          tabIndex={0}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </form>
    </>
  );
};
