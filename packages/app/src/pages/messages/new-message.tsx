import { MessagePreset } from "@/hooks/use-message-presets";
import { joystickApi } from "@/lib/api-client";
import { urls } from "@/lib/urls";
import { toast } from "@/utils/toast";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";

type SlotSelection = "primary" | "secondary" | "both";

interface NewMessageProps {
  deviceId: string;
  selectedSlot: SlotSelection;
  onPresetSelect?: (preset: MessagePreset) => void;
  selectedPreset?: MessagePreset | null;
}

export const NewMessage = ({
  deviceId,
  selectedSlot,
  selectedPreset,
}: NewMessageProps) => {
  const [input, setInput] = useState("");

  useEffect(() => {
    if (selectedPreset) {
      setInput(selectedPreset.message);
    }
  }, [selectedPreset]);
  const { mutate: sendMessageMutation, isPending } = useMutation({
    mutationFn: async () => {
      const result = await joystickApi.post<{
        success: boolean;
        output: string;
      }>(`${urls.whisper}/api/${deviceId}/send-sms`, {
        message: input,
        slot: selectedSlot,
      });

      try {
        if (!result.success) {
          const output: {
            success: boolean;
            error?: string;
            message?: string;
          } = JSON.parse(result?.output || "{}");

          toast.error({
            message: `Failed to send message: ${`${selectedSlot}: ${
              output.error || output.message || "Failed to send message"
            }`}`,
          });
        }
      } catch {
        toast.error({
          message: "Failed to send message",
        });
      }
    },
    onSuccess: async () => {
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
        className="flex items-center gap-3"
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
          className="h-[44px] w-[44px] rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center"
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
