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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDevice } from "@/lib/device";
import { DeviceAutomation, DeviceResponse, UpdateDevice } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface AutomationEditorProps {
  device: DeviceResponse;
}

export function AutomationEditor({ device }: AutomationEditorProps) {
  const queryClient = useQueryClient();
  const [editingAutomation, setEditingAutomation] = useState<{
    id: string;
    automation: DeviceAutomation | null;
  } | null>(null);

  const { mutate: updateDeviceMutation } = useMutation({
    mutationFn: async (data: UpdateDevice) => {
      await updateDevice(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Device updated successfully");
      setEditingAutomation(null);
    },
    onError: (error) => {
      toast.error("Failed to update device: " + error.message);
    },
  });

  return (
    <Dialog
      open={editingAutomation?.id === device.id}
      onOpenChange={(open: boolean) => {
        if (!open) setEditingAutomation(null);
        else
          setEditingAutomation({
            id: device.id,
            automation: device.automation,
          });
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {device.automation
            ? `${device.automation.minutesOn}m on / ${device.automation.minutesOff}m off`
            : "Configure"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Automation Settings</DialogTitle>
          <DialogDescription>
            Configure the device's on/off cycle duration in minutes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="minutesOn"
              className="text-right text-sm font-medium"
            >
              Minutes On
            </Label>
            <Input
              id="minutesOn"
              type="number"
              className="col-span-3"
              value={editingAutomation?.automation?.minutesOn ?? 0}
              onChange={(e) =>
                setEditingAutomation((prev) => ({
                  id: prev?.id ?? device.id,
                  automation: {
                    minutesOn: parseInt(e.target.value),
                    minutesOff: prev?.automation?.minutesOff ?? 0,
                  },
                }))
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="minutesOff"
              className="text-right text-sm font-medium"
            >
              Minutes Off
            </Label>
            <Input
              id="minutesOff"
              type="number"
              className="col-span-3"
              value={editingAutomation?.automation?.minutesOff ?? 0}
              onChange={(e) =>
                setEditingAutomation((prev) => ({
                  id: prev?.id ?? device.id,
                  automation: {
                    minutesOn: prev?.automation?.minutesOn ?? 0,
                    minutesOff: parseInt(e.target.value),
                  },
                }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingAutomation(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!editingAutomation) return;
              updateDeviceMutation({
                id: editingAutomation.id,
                automation: editingAutomation.automation,
              });
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
