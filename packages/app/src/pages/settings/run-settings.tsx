import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { pb } from "@/lib/pocketbase";
import { ActionsResponse, ModelsResponse } from "@/types/db.types";
import { RunResponse } from "@/types/types";
import { toast } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Cpu,
  Edit2,
  Loader2,
  Plus,
  Server,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

interface RunConfig {
  id: string;
  action: string;
  device: string;
  command: string;
  target: "local" | "device";
  parameters?: Record<string, unknown>;
}

export function RunSettings() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCommandId, setEditingCommandId] = useState<string | null>(null);
  const [editedCommand, setEditedCommand] = useState("");
  const [newRunConfig, setNewRunConfig] = useState<Omit<RunConfig, "id">>({
    action: "",
    device: "",
    command: "",
    target: "local",
    parameters: {},
  });
  const [jsonParameters, setJsonParameters] = useState("{}");
  const [jsonError, setJsonError] = useState("");
  const queryClient = useQueryClient();

  // Fetch run configurations
  const {
    data: runConfigs,
    isLoading: isLoadingRunConfigs,
    error: runConfigsError,
  } = useQuery({
    queryKey: ["runConfigs"],
    queryFn: async () => {
      const records = await pb.collection("run").getFullList<RunResponse>({
        expand: "action,device",
      });
      return records;
    },
  });

  // Fetch actions
  const {
    data: actions,
    isLoading: isLoadingActions,
    error: actionsError,
  } = useQuery({
    queryKey: ["actions"],
    queryFn: async () => {
      const records = await pb
        .collection("actions")
        .getFullList<ActionsResponse>();
      return records;
    },
  });

  // Fetch devices
  const {
    data: devices,
    isLoading: isLoadingDevices,
    error: devicesError,
  } = useQuery({
    queryKey: ["models"],
    queryFn: async () => {
      const records = await pb
        .collection("models")
        .getFullList<ModelsResponse>();
      return records;
    },
  });

  // Create run config mutation
  const createRunConfigMutation = useMutation({
    mutationFn: async (data: Omit<RunConfig, "id">) => {
      return await pb.collection("run").create(data);
    },
    onSuccess: () => {
      toast.success({
        message: "Run configuration created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["runConfigs"] });
      setIsAddDialogOpen(false);
      resetNewRunConfig();
    },
    onError: (error) => {
      console.error("Error creating run configuration:", error);
      toast.error({
        message: "Failed to create run configuration",
      });
    },
  });

  // Delete run config mutation
  const deleteRunConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      return await pb.collection("run").delete(id);
    },
    onSuccess: () => {
      toast.success({
        message: "Run configuration deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["runConfigs"] });
    },
    onError: (error) => {
      console.error("Error deleting run configuration:", error);
      toast.error({
        message: "Failed to delete run configuration",
      });
    },
  });

  // Edit run config mutation
  const editRunConfigMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<RunConfig>;
    }) => {
      return await pb.collection("run").update(id, data);
    },
    onSuccess: () => {
      toast.success({
        message: "Run configuration updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["runConfigs"] });
    },
    onError: (error) => {
      console.error("Error updating run configuration:", error);
      toast.error({
        message: "Failed to update run configuration",
      });
    },
  });

  const resetNewRunConfig = () => {
    setNewRunConfig({
      action: "",
      device: "",
      command: "",
      target: "local",
      parameters: {},
    });
    setJsonParameters("{}");
    setJsonError("");
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonParameters(e.target.value);
    setJsonError("");

    try {
      const parsed = JSON.parse(e.target.value);
      setNewRunConfig({
        ...newRunConfig,
        parameters: parsed,
      });
    } catch {
      setJsonError("Invalid JSON format");
    }
  };

  const handleRemoveParameter = (key: string) => {
    const updatedParams = { ...newRunConfig.parameters };
    delete updatedParams[key];
    setNewRunConfig({
      ...newRunConfig,
      parameters: updatedParams,
    });

    // Update JSON representation
    setJsonParameters(JSON.stringify(updatedParams, null, 2));
  };

  const handleCreateRunConfig = () => {
    if (!newRunConfig.action || !newRunConfig.device || !newRunConfig.command) {
      toast.error({
        message: "Action, device, and command are required",
      });
      return;
    }

    if (jsonError) {
      toast.error({
        message: "Invalid JSON parameters",
      });
      return;
    }

    createRunConfigMutation.mutate(newRunConfig);
  };

  const handleDeleteRunConfig = (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this run configuration?")
    ) {
      deleteRunConfigMutation.mutate(id);
    }
  };

  const handleToggleTargetType = (
    id: string,
    currentTarget: "local" | "device"
  ) => {
    const newTarget = currentTarget === "local" ? "device" : "local";
    editRunConfigMutation.mutate({
      id,
      data: { target: newTarget },
    });
  };

  const handleEditCommand = (id: string, currentCommand: string) => {
    setEditingCommandId(id);
    setEditedCommand(currentCommand);
  };

  const handleSaveCommand = (id: string) => {
    if (editedCommand.trim() === "") {
      toast.error({
        message: "Command cannot be empty",
      });
      return;
    }

    editRunConfigMutation.mutate(
      {
        id,
        data: { command: editedCommand.trim() },
      },
      {
        onSuccess: () => {
          setEditingCommandId(null);
          setEditedCommand("");
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingCommandId(null);
    setEditedCommand("");
  };

  if (isLoadingRunConfigs || isLoadingActions || isLoadingDevices) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (runConfigsError || actionsError || devicesError) {
    return (
      <div className="p-4 border border-destructive rounded-md bg-destructive/10 text-destructive">
        Error loading data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Run Configurations</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Run Configuration</DialogTitle>
              <DialogDescription>
                Configure command execution for device actions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="action">Action</Label>
                  <Select
                    value={newRunConfig.action}
                    onValueChange={(value) =>
                      setNewRunConfig({ ...newRunConfig, action: value })
                    }
                  >
                    <SelectTrigger id="action">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actions?.map((action) => (
                        <SelectItem key={action.id} value={action.id}>
                          {action.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device">Device Model</Label>
                  <Select
                    value={newRunConfig.device}
                    onValueChange={(value) =>
                      setNewRunConfig({ ...newRunConfig, device: value })
                    }
                  >
                    <SelectTrigger id="device">
                      <SelectValue placeholder="Select device model" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices?.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="command">Command</Label>
                <Input
                  id="command"
                  value={newRunConfig.command}
                  onChange={(e) =>
                    setNewRunConfig({
                      ...newRunConfig,
                      command: e.target.value,
                    })
                  }
                  placeholder="Command to execute"
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="target">Run on Device</Label>
                  <p className="text-sm text-muted-foreground">
                    Execute command on the device instead of locally
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {newRunConfig.target === "device" ? (
                    <Cpu className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Server className="h-4 w-4 text-green-500" />
                  )}
                  <Switch
                    id="target"
                    checked={newRunConfig.target === "device"}
                    onCheckedChange={(checked) =>
                      setNewRunConfig({
                        ...newRunConfig,
                        target: checked ? "device" : "local",
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Parameters</Label>
                </div>

                <Textarea
                  value={jsonParameters}
                  onChange={handleJsonChange}
                  className="font-mono text-sm h-[120px]"
                  placeholder="{}"
                />
                {jsonError && (
                  <p className="text-sm text-destructive mt-1">{jsonError}</p>
                )}

                {Object.keys(newRunConfig.parameters || {}).length > 0 && (
                  <div className="mt-2 border rounded-md p-2">
                    <div className="text-sm font-medium mb-2">
                      Current Parameters:
                    </div>
                    <div className="space-y-1">
                      {Object.entries(newRunConfig.parameters || {}).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center"
                          >
                            <div>
                              <span className="font-medium">{key}:</span>{" "}
                              <span className="text-muted-foreground">
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveParameter(key)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRunConfig}
                disabled={createRunConfigMutation.isPending}
              >
                {createRunConfigMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="rounded-md overflow-hidden">
            <div className="relative">
              <div className="border-b sticky top-0 z-10 bg-background">
                <div className="flex w-full">
                  <div className="h-10 px-4 py-3 font-medium text-muted-foreground w-[12%] text-left">
                    Action
                  </div>
                  <div className="h-10 px-4 py-3 font-medium text-muted-foreground w-[12%] text-left">
                    Device
                  </div>
                  <div className="h-10 px-4 py-3 font-medium text-muted-foreground w-[50%] text-left">
                    Command
                  </div>
                  <div className="h-10 px-4 py-3 font-medium text-muted-foreground w-[16%] text-left">
                    Target
                  </div>
                  <div className="h-10 px-4 py-3 font-medium text-muted-foreground w-[10%] text-right">
                    Actions
                  </div>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                <Table className="w-full">
                  <TableBody>
                    {runConfigs?.length === 0 ? (
                      <TableRow className="border-b hover:bg-muted/30">
                        <TableCell
                          colSpan={5}
                          className="text-center px-4 py-8 text-muted-foreground"
                        >
                          No run configurations found. Create one to get
                          started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      runConfigs?.map((config) => (
                        <TableRow
                          key={config.id}
                          className="border-b hover:bg-muted/30"
                        >
                          <TableCell className="p-4 w-[12%]">
                            {config.expand?.action?.name || config.action}
                          </TableCell>
                          <TableCell className="p-4 w-[12%]">
                            {config.expand?.device?.name || config.device}
                          </TableCell>
                          <TableCell className="p-4 font-mono text-xs text-muted-foreground w-[50%]">
                            {editingCommandId === config.id ? (
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={editedCommand}
                                  onChange={(e) =>
                                    setEditedCommand(e.target.value)
                                  }
                                  className="h-8 text-xs font-mono"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleSaveCommand(config.id);
                                    } else if (e.key === "Escape") {
                                      handleCancelEdit();
                                    }
                                  }}
                                />

                                <div className="flex items-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleSaveCommand(config.id)}
                                    className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCancelEdit}
                                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between group">
                                <div title={config.command}>
                                  {config.command}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleEditCommand(config.id, config.command)
                                  }
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="p-4 w-[16%]">
                            <Tabs
                              defaultValue={config.target}
                              onValueChange={(value) =>
                                handleToggleTargetType(
                                  config.id,
                                  value as "local" | "device"
                                )
                              }
                              className="w-[140px]"
                            >
                              <TabsList className="grid w-full grid-cols-2 h-8">
                                <TabsTrigger
                                  value="local"
                                  className="text-xs px-2 py-1 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 dark:data-[state=active]:bg-green-950/30 dark:data-[state=active]:text-green-400"
                                >
                                  <Server className="h-3.5 w-3.5 mr-1 text-muted-foreground data-[state=active]:text-green-500" />
                                  Local
                                </TabsTrigger>
                                <TabsTrigger
                                  value="device"
                                  className="text-xs px-2 py-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-950/30 dark:data-[state=active]:text-blue-400"
                                >
                                  <Cpu className="h-3.5 w-3.5 mr-1 text-muted-foreground data-[state=active]:text-blue-500" />
                                  Device
                                </TabsTrigger>
                              </TabsList>
                            </Tabs>
                          </TableCell>
                          <TableCell className="p-4 text-right w-[10%]">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteRunConfig(config.id)}
                              title="Delete Configuration"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        <p>
          Run configurations define how actions are executed for specific device
          models.
        </p>
        <div className="flex items-center mt-2 gap-4">
          <div className="flex items-center gap-1">
            <Server className="h-4 w-4 text-green-500" />
            <span className="text-xs">Local: Run on server</span>
          </div>
          <div className="flex items-center gap-1">
            <Cpu className="h-4 w-4 text-blue-500" />
            <span className="text-xs">Device: Run on device</span>
          </div>
        </div>
      </div>
    </div>
  );
}
