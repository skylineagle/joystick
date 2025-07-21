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
import { useAuthStore } from "@/lib/auth";
import { pb } from "@/lib/pocketbase";
import { MessagePreset } from "@/hooks/use-message-presets";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeviceResponse } from "@/types/types";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/utils/toast";
import { motion, AnimatePresence } from "framer-motion";

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

  if (presets.length === 0 && isAdmin) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <h3 className="text-sm font-medium text-foreground">Quick Presets</h3>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 hover:bg-primary/10"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg">Add Quick Preset</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Create a reusable message template
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="preset-name" className="text-sm font-medium">Preset Name</Label>
                  <Input
                    id="preset-name"
                    value={newPreset.name}
                    onChange={(e) =>
                      setNewPreset({ ...newPreset, name: e.target.value })
                    }
                    placeholder="e.g., Greeting, Status Update"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preset-message" className="text-sm font-medium">Message Content</Label>
                  <Textarea
                    id="preset-message"
                    value={newPreset.message}
                    onChange={(e) =>
                      setNewPreset({ ...newPreset, message: e.target.value })
                    }
                    placeholder="Enter your message template..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddPreset} 
                  disabled={isAdding}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isAdding ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </div>
                  ) : (
                    "Create Preset"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center justify-center py-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto">
              <Plus className="w-5 h-5 text-primary/60" />
            </div>
            <p className="text-sm text-muted-foreground">No presets yet</p>
            <p className="text-xs text-muted-foreground">Create your first message template</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <h3 className="text-sm font-medium text-foreground">Quick Presets</h3>
        </div>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 hover:bg-primary/10"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg">
                      Add Quick Preset
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Create a reusable message template
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="preset-name" className="text-sm font-medium">
                    Preset Name
                  </Label>
                  <Input
                    id="preset-name"
                    value={newPreset.name}
                    onChange={(e) =>
                      setNewPreset({ ...newPreset, name: e.target.value })
                    }
                    placeholder="e.g., Greeting, Status Update"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="preset-message"
                    className="text-sm font-medium"
                  >
                    Message Content
                  </Label>
                  <Textarea
                    id="preset-message"
                    value={newPreset.message}
                    onChange={(e) =>
                      setNewPreset({ ...newPreset, message: e.target.value })
                    }
                    placeholder="Enter your message template..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPreset}
                  disabled={isAdding}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isAdding ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </div>
                  ) : (
                    "Create Preset"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <div key={preset.id} className="group relative">
            <button
              onClick={() => onPresetSelect(preset)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-primary/20 hover:border-primary/30 rounded-full text-sm font-medium text-foreground transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer max-w-[200px]"
            >
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              <span className="truncate">{preset.name}</span>
            </button>

            {isAdmin && (
              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex items-center gap-1 bg-background border border-border rounded-full shadow-lg p-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(preset);
                    }}
                    className="h-5 w-5 p-0 hover:bg-muted"
                  >
                    <Edit className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePreset(preset.id);
                    }}
                    disabled={isDeleting}
                    className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </Button>
                </div>
              </div>
            )}

            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {preset.message}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                <Edit className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg">Edit Quick Preset</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Update your message template
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-preset-name" className="text-sm font-medium">Preset Name</Label>
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
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-preset-message" className="text-sm font-medium">Message Content</Label>
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
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsEditDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditPreset} 
              disabled={isUpdating}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                "Update Preset"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
