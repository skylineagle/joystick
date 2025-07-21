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
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessagePreset } from "@/hooks/use-message-presets";
import { useAuthStore } from "@/lib/auth";
import { pb } from "@/lib/pocketbase";
import { DeviceResponse } from "@/types/types";
import { toast } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface MessagePresetsManagerProps {
  deviceId: string;
  presets: MessagePreset[];
  onPresetSelect: (preset: MessagePreset) => void;
}

export const MessagePresetsManager = ({
  deviceId,
  presets,
  onPresetSelect,
}: MessagePresetsManagerProps) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<MessagePreset | null>(
    null
  );
  const [newPreset, setNewPreset] = useState({ name: "", message: "" });
  const [isExpanded, setIsExpanded] = useState(true);

  const isAdmin = user?.email?.startsWith("admin");

  const { mutate: addPreset, isPending: isAdding } = useMutation({
    mutationFn: async (preset: Omit<MessagePreset, "id">) => {
      const devices = await pb
        .collection("devices")
        .getFullList<DeviceResponse>({
          filter: `id = "${deviceId}"`,
          expand: "device",
        });

      if (!devices[0]?.expand?.device) {
        throw new Error("Device not found");
      }

      const model = devices[0].expand.device;
      const currentPresets = model.message_persets || [];
      const updatedPresets = [
        ...currentPresets,
        { ...preset, id: crypto.randomUUID() },
      ];

      await pb.collection("models").update(model.id, {
        message_persets: updatedPresets,
      });

      return updatedPresets;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["message-presets", deviceId],
      });
      setIsAddDialogOpen(false);
      setNewPreset({ name: "", message: "" });
      toast.success({ message: "Preset added successfully" });
    },
    onError: (error) => {
      toast.error({ message: `Failed to add preset: ${error.message}` });
    },
  });

  const { mutate: updatePreset, isPending: isUpdating } = useMutation({
    mutationFn: async (preset: MessagePreset) => {
      const devices = await pb
        .collection("devices")
        .getFullList<DeviceResponse>({
          filter: `id = "${deviceId}"`,
          expand: "device",
        });

      if (!devices[0]?.expand?.device) {
        throw new Error("Device not found");
      }

      const model = devices[0].expand.device;
      const currentPresets = model.message_persets || [];
      const updatedPresets = currentPresets.map((p: MessagePreset) =>
        p.id === preset.id ? preset : p
      );

      await pb.collection("models").update(model.id, {
        message_persets: updatedPresets,
      });

      return updatedPresets;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["message-presets", deviceId],
      });
      setIsEditDialogOpen(false);
      setEditingPreset(null);
      toast.success({ message: "Preset updated successfully" });
    },
    onError: (error) => {
      toast.error({ message: `Failed to update preset: ${error.message}` });
    },
  });

  const { mutate: deletePreset, isPending: isDeleting } = useMutation({
    mutationFn: async (presetId: string) => {
      const devices = await pb
        .collection("devices")
        .getFullList<DeviceResponse>({
          filter: `id = "${deviceId}"`,
          expand: "device",
        });

      if (!devices[0]?.expand?.device) {
        throw new Error("Device not found");
      }

      const model = devices[0].expand.device;
      const currentPresets = model.message_persets || [];
      const updatedPresets = currentPresets.filter(
        (p: MessagePreset) => p.id !== presetId
      );

      await pb.collection("models").update(model.id, {
        message_persets: updatedPresets,
      });

      return updatedPresets;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["message-presets", deviceId],
      });
      toast.success({ message: "Preset deleted successfully" });
    },
    onError: (error) => {
      toast.error({ message: `Failed to delete preset: ${error.message}` });
    },
  });

  const handleAddPreset = () => {
    if (!newPreset.name.trim() || !newPreset.message.trim()) {
      toast.error({ message: "Please fill in all fields" });
      return;
    }
    addPreset(newPreset);
  };

  const handleEditPreset = () => {
    if (
      !editingPreset ||
      !editingPreset.name.trim() ||
      !editingPreset.message.trim()
    ) {
      toast.error({ message: "Please fill in all fields" });
      return;
    }
    updatePreset(editingPreset);
  };

  const handleDeletePreset = (presetId: string) => {
    if (confirm("Are you sure you want to delete this preset?")) {
      deletePreset(presetId);
    }
  };

  const openEditDialog = (preset: MessagePreset) => {
    setEditingPreset({ ...preset });
    setIsEditDialogOpen(true);
  };

  if (presets.length === 0 && !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:bg-muted/50 rounded-md px-2 py-1 transition-colors duration-200"
        >
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            Quick Presets
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          )}
        </button>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 px-2">
                <Plus className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Quick Preset</DialogTitle>
                <DialogDescription>
                  Create a reusable message template
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preset-name">Preset Name</Label>
                  <Input
                    id="preset-name"
                    value={newPreset.name}
                    onChange={(e) =>
                      setNewPreset({ ...newPreset, name: e.target.value })
                    }
                    placeholder="e.g., Greeting, Status Update"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preset-message">Message Content</Label>
                  <Textarea
                    id="preset-message"
                    value={newPreset.message}
                    onChange={(e) =>
                      setNewPreset({ ...newPreset, message: e.target.value })
                    }
                    placeholder="Enter your message template..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddPreset} disabled={isAdding}>
                  {isAdding ? "Adding..." : "Create Preset"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isExpanded && (
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <div key={preset.id} className="group relative">
              <div
                onClick={() => onPresetSelect(preset)}
                className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 rounded-full text-sm font-medium text-foreground transition-all duration-200 cursor-pointer w-fit"
              >
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <span className="truncate max-w-[120px]">{preset.name}</span>
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        onClick={() => openEditDialog(preset)}
                        className="text-xs"
                      >
                        <Edit className="w-3 h-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeletePreset(preset.id)}
                        disabled={isDeleting}
                        className="text-xs text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-[200px]">
                {preset.message}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Quick Preset</DialogTitle>
            <DialogDescription>Update your message template</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-preset-name">Preset Name</Label>
              <Input
                id="edit-preset-name"
                value={editingPreset?.name || ""}
                onChange={(e) =>
                  setEditingPreset(
                    editingPreset
                      ? { ...editingPreset, name: e.target.value }
                      : null
                  )
                }
                placeholder="e.g., Greeting, Status Update"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-preset-message">Message Content</Label>
              <Textarea
                id="edit-preset-message"
                value={editingPreset?.message || ""}
                onChange={(e) =>
                  setEditingPreset(
                    editingPreset
                      ? { ...editingPreset, message: e.target.value }
                      : null
                  )
                }
                placeholder="Enter your message template..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPreset} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Preset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
