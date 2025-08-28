import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceInformation } from "@/types/types";
import { MessageSquare, MessageSquareMore } from "lucide-react";

export type SlotSelection = "primary" | "secondary" | "both";

interface HeaderSlotSelectorProps {
  deviceInfo: DeviceInformation;
  selectedSlot: SlotSelection;
  onSlotChange: (slot: SlotSelection) => void;
  disabled?: boolean;
}

export const HeaderSlotSelector = ({
  deviceInfo,
  selectedSlot,
  onSlotChange,
  disabled = false,
}: HeaderSlotSelectorProps) => {
  const hasSecondarySlot = !!deviceInfo.secondSlotPhone;

  if (!hasSecondarySlot) {
    return null;
  }

  return (
    <Tabs
      value={selectedSlot}
      onValueChange={(value) => onSlotChange(value as SlotSelection)}
      className="w-auto"
    >
      <TabsList className="grid w-full grid-cols-3 h-8">
        <TabsTrigger
          value="primary"
          disabled={disabled}
          className="flex items-center space-x-1 text-xs"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Slot 1</span>
        </TabsTrigger>
        <TabsTrigger
          value="secondary"
          disabled={disabled}
          className="flex items-center space-x-1 text-xs"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Slot 2</span>
        </TabsTrigger>
        <TabsTrigger
          value="both"
          disabled={disabled}
          className="flex items-center space-x-1 text-xs"
        >
          <MessageSquareMore className="w-3 h-3" />
          <span>Both</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
