import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  CardType,
  type CardConfig,
  type LocationCardConfig,
  type ParamValueEditorCardConfig,
  type StreamViewCardConfig,
} from "@/types/dashboard-cards";
import { useDevices } from "@/hooks/use-devices";
import { Plus } from "lucide-react";
import MultipleSelector, { type Option } from "@/components/ui/multiselect";
import { devicesToOptions } from "@/lib/device-utils";

const CARD_TYPES = [
  { type: CardType.STREAM_VIEW, name: "Stream View" },
  { type: CardType.BATTERY_STATUS, name: "Battery Status" },
  { type: CardType.CELL_STATUS, name: "Cell Status" },
  { type: CardType.LOCATION, name: "Location" },
  { type: CardType.IMU_STATUS, name: "IMU Status" },
  { type: CardType.ACTION_RUNNER, name: "Action Runner" },
  { type: CardType.PARAM_VALUE_EDITOR, name: "Parameter Value Editor" },
];

interface AddCardDialogProps {
  onAddCard: (config: Omit<CardConfig, "id">) => void;
}

export const AddCardDialog = ({ onAddCard }: AddCardDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>();
  const [selectedDeviceOptions, setSelectedDeviceOptions] = useState<Option[]>(
    []
  );
  const [selectedCardType, setSelectedCardType] = useState<CardType>();
  const { data: devices, isLoading: isLoadingDevices } = useDevices();

  const deviceOptions = devicesToOptions(devices);

  const handleAddClick = () => {
    if (!selectedCardType) {
      alert("Please select a card type");
      return;
    }

    switch (selectedCardType) {
      case CardType.LOCATION:
        onAddCard({
          type: CardType.LOCATION,
          deviceIds: selectedDeviceOptions.map((option) => option.value),
        } as Omit<LocationCardConfig, "id">);
        break;
      case CardType.PARAM_VALUE_EDITOR:
        if (!selectedDeviceId) {
          alert("Please select a device");
          return;
        }
        onAddCard({
          type: CardType.PARAM_VALUE_EDITOR,
          deviceId: selectedDeviceId,
          paramKey: "",
          paramConfig: {
            type: "string",
            title: "",
          },
        } as Omit<ParamValueEditorCardConfig, "id">);
        break;
      default:
        if (!selectedDeviceId) {
          alert("Please select a device");
          return;
        }
        onAddCard({
          type: selectedCardType,
          deviceId: selectedDeviceId,
        } as Omit<StreamViewCardConfig, "id">);
    }

    // Reset selections and close dialog
    setSelectedDeviceId(undefined);
    setSelectedDeviceOptions([]);
    setSelectedCardType(undefined);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Card</DialogTitle>
          <DialogDescription>
            Create a new card for your dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="card-type-select" className="text-right">
              Card Type
            </Label>
            <Select
              value={selectedCardType}
              onValueChange={(value) => {
                setSelectedCardType(value as CardType);
                // Reset device selections when changing card type
                setSelectedDeviceId(undefined);
                setSelectedDeviceOptions([]);
              }}
            >
              <SelectTrigger id="card-type-select" className="col-span-3">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {CARD_TYPES.map((cardType) => (
                  <SelectItem key={cardType.type} value={cardType.type}>
                    {cardType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="device-select" className="text-right pt-2">
              {selectedCardType === CardType.LOCATION ? "Devices" : "Device"}
            </Label>
            <div className="col-span-3">
              {selectedCardType === CardType.LOCATION ? (
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
                <Select
                  value={selectedDeviceId}
                  onValueChange={setSelectedDeviceId}
                  disabled={isLoadingDevices}
                >
                  <SelectTrigger id="device-select" className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingDevices ? "Loading..." : "Select a device"
                      }
                    />
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
        <DialogFooter>
          <Button
            type="button"
            onClick={handleAddClick}
            disabled={
              !selectedCardType ||
              (selectedCardType === CardType.LOCATION
                ? selectedDeviceOptions.length === 0
                : !selectedDeviceId)
            }
          >
            Add Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
