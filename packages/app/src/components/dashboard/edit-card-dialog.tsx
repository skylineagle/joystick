import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import MultipleSelector, { type Option } from "@/components/ui/multiselect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDevices } from "@/hooks/use-devices";
import { deviceIdsToOptions, devicesToOptions } from "@/lib/device-utils";
import { CardType, type CardConfig } from "@/types/dashboard-cards";
import { useState } from "react";

interface EditCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cardConfig: CardConfig;
  onSave: (updatedConfig: CardConfig) => void;
  onDelete: (cardId: string) => void;
}

export const EditCardDialog = ({
  isOpen,
  onClose,
  cardConfig,
  onSave,
  onDelete,
}: EditCardDialogProps) => {
  const [deviceId, setDeviceId] = useState(
    "deviceId" in cardConfig ? cardConfig.deviceId : undefined
  );
  const [selectedDeviceOptions, setSelectedDeviceOptions] = useState<Option[]>(
    []
  );
  const { data: devices } = useDevices();

  const deviceOptions = devicesToOptions(devices);

  // Initialize selected devices when dialog opens
  useState(() => {
    if (cardConfig.type === CardType.LOCATION) {
      setSelectedDeviceOptions(
        deviceIdsToOptions(cardConfig.deviceIds, devices)
      );
    }
  });

  const handleSave = () => {
    const baseConfig = {
      ...cardConfig,
    };

    let updatedConfig: CardConfig;

    switch (cardConfig.type) {
      case CardType.LOCATION:
        updatedConfig = {
          ...baseConfig,
          deviceIds: selectedDeviceOptions.map((option) => option.value),
        } as CardConfig;
        break;
      case CardType.PARAM_VALUE_EDITOR:
        if (!deviceId) return;
        updatedConfig = {
          ...baseConfig,
          deviceId,
          paramKey: cardConfig.paramKey || "",
          paramConfig: cardConfig.paramConfig || {
            type: "string",
            title: "",
          },
        } as CardConfig;
        break;
      default:
        if (!deviceId) return;
        updatedConfig = {
          ...baseConfig,
          deviceId,
        } as CardConfig;
    }

    onSave(updatedConfig);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Make changes to your dashboard card.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="device-select" className="text-right pt-2">
              {cardConfig.type === CardType.LOCATION ? "Devices" : "Device"}
            </Label>
            <div className="col-span-3">
              {cardConfig.type === CardType.LOCATION ? (
                <MultipleSelector
                  value={selectedDeviceOptions}
                  onChange={setSelectedDeviceOptions}
                  defaultOptions={deviceOptions}
                  placeholder="Select devices"
                  commandProps={{
                    label: "Select devices",
                  }}
                  hidePlaceholderWhenSelected
                  emptyIndicator={
                    <p className="text-center text-sm">No devices found</p>
                  }
                />
              ) : (
                <Select value={deviceId} onValueChange={setDeviceId}>
                  <SelectTrigger id="device-select" className="w-full">
                    <SelectValue placeholder="Select a device" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices?.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        {device.name || device.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(cardConfig.id)}
          >
            Delete Card
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={
              cardConfig.type === CardType.LOCATION
                ? selectedDeviceOptions.length === 0
                : !deviceId
            }
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
