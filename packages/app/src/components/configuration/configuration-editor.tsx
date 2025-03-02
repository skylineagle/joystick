import { deviceConfigSchema } from "@/components/configuration/consts";
import { EditorMarker } from "@/components/configuration/types";
import { useTheme } from "@/components/theme-provider";
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
import { SelectMode } from "@/components/ui/select-mode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAction } from "@/hooks/use-action";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { updateDevice } from "@/lib/device";
import { cn, getModeOptionsFromSchema } from "@/lib/utils";
import { DevicesStatusOptions } from "@/types/db.types";
import { DeviceAutomation, DeviceResponse, UpdateDevice } from "@/types/types";
import { toast } from "@/utils/toast";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import type * as Monaco from "monaco-editor";
import { useCallback, useRef, useState } from "react";

export interface ConfigurationEditorProps {
  device: DeviceResponse;
}

export function ConfigurationEditor({ device }: ConfigurationEditorProps) {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isAllowedToEditConfig = useIsPermitted("edit-config");
  const { action, isLoading: isActionLoading } = useAction(
    device.id,
    "set-mode"
  );
  const availableModes = getModeOptionsFromSchema(action?.parameters ?? {});
  const [editingConfig, setEditingConfig] = useState<{
    id: string;
    config: string;
    automation: DeviceAutomation | null;
    name: string;
  } | null>(null);
  const [isJsonValid, setIsJsonValid] = useState(true);
  const [currentTab, setCurrentTab] = useState<"general" | "config">("general");
  const monacoRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const { mutate: updateDeviceMutation } = useMutation({
    mutationFn: async (data: UpdateDevice) => {
      if (
        (data.configuration || data.automation) &&
        device.status !== DevicesStatusOptions.off
      ) {
        throw new Error(
          "Configuration and automation can only be updated when device is off"
        );
      }
      await updateDevice(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success({
        message: "Device updated successfully",
      });
      setEditingConfig(null);
    },
    onError: (error) => {
      toast.error({
        message: "Failed to update device - " + error.message,
      });
    },
  });

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    monacoRef.current = editor;

    // Configure JSON schema
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: "http://myschema/device-config.json",
          fileMatch: ["*"],
          schema: deviceConfigSchema,
        },
      ],
      enableSchemaRequest: false,
    });
  };

  function handleEditorValidation(markers: EditorMarker[]) {
    setIsJsonValid(markers.length === 0);
  }

  const isAutomationValid = useCallback(() => {
    if (!editingConfig?.automation) return false;
    const { on, off } = editingConfig.automation;
    return on?.minutes > 0 && off?.minutes > 0;
  }, [editingConfig]);

  const isSaveDisabled = useCallback(() => {
    if (currentTab === "config") return !isJsonValid;
    return !isAutomationValid();
  }, [currentTab, isJsonValid, isAutomationValid]);

  const handleSave = useCallback(() => {
    if (!editingConfig) return;

    if (currentTab === "config") {
      try {
        const parsedConfig = JSON.parse(editingConfig.config);
        updateDeviceMutation({
          id: editingConfig.id,
          configuration: parsedConfig,
          automation: editingConfig.automation,
          name: editingConfig.name,
        });
      } catch {
        toast.error({
          message: "Invalid JSON configuration",
        });
      }
    } else {
      if (!isAutomationValid()) {
        toast.error({
          message: "On and Off minutes must be greater than 0",
        });
        return;
      }
      updateDeviceMutation({
        id: editingConfig.id,
        configuration: JSON.parse(editingConfig.config),
        automation: editingConfig.automation,
        name: editingConfig.name,
      });
    }
  }, [editingConfig, currentTab, updateDeviceMutation, isAutomationValid]);

  return (
    <Dialog
      open={editingConfig?.id === device.id}
      onOpenChange={(open: boolean) => {
        if (!open) setEditingConfig(null);
        else
          setEditingConfig({
            id: device.id,
            config: JSON.stringify(device.configuration, null, 2),
            automation: device.automation,
            name: device.name ?? "",
          });
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={device.status !== DevicesStatusOptions.off}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Camera Settings</DialogTitle>
          <DialogDescription>
            Configure camera settings and automation.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          defaultValue="general"
          onValueChange={(value) =>
            setCurrentTab(value as "general" | "config")
          }
        >
          <TabsList
            className={cn(
              "w-full",
              "grid",
              isAllowedToEditConfig ? "grid-cols-2" : "grid-cols-1"
            )}
          >
            <TabsTrigger className="w-full" value="general">
              <Label className="text-foreground">General</Label>
            </TabsTrigger>
            {isAllowedToEditConfig && (
              <TabsTrigger className="w-full" value="config">
                <Label className="text-foreground">Configuration</Label>
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="config" className="py-4">
            <Editor
              height="400px"
              theme={theme === "dark" ? "vs-dark" : "light"}
              defaultLanguage="json"
              value={editingConfig?.config ?? ""}
              onChange={(value) =>
                setEditingConfig((prev) =>
                  prev ? { ...prev, config: value ?? "" } : null
                )
              }
              onMount={handleEditorDidMount}
              onValidate={handleEditorValidation}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
              }}
            />
          </TabsContent>
          <TabsContent value="general" className="py-4">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={editingConfig?.name ?? ""}
                  onChange={(e) =>
                    setEditingConfig((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">On Settings</h3>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-sm font-medium">Mode</Label>
                  <div className="col-span-3">
                    <SelectMode
                      mode={editingConfig?.automation?.on?.mode ?? ""}
                      handleModeChange={(value) =>
                        setEditingConfig((prev) => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            automation: {
                              ...prev.automation,
                              on: {
                                ...(prev.automation?.on || { minutes: 0 }),
                                mode: value,
                              },
                              off: prev.automation?.off || {
                                minutes: prev.automation?.off?.minutes ?? 0,
                                mode:
                                  prev.automation?.off?.mode ??
                                  availableModes[0],
                              },
                            },
                          };
                        })
                      }
                      isLoading={isActionLoading}
                      availableModes={availableModes}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="minutesOn"
                    className="text-right text-sm font-medium"
                  >
                    Minutes On
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="minutesOn"
                      type="number"
                      value={editingConfig?.automation?.on?.minutes ?? 0}
                      min={1}
                      onChange={(e) =>
                        setEditingConfig((prev) => ({
                          ...prev!,
                          automation: {
                            on: {
                              minutes: parseInt(e.target.value),
                              mode: prev?.automation?.on?.mode ?? "auto",
                            },
                            off: {
                              minutes: prev?.automation?.off?.minutes ?? 0,
                              mode: prev?.automation?.off?.mode ?? "auto",
                            },
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Off Settings</h3>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-sm font-medium">Mode</Label>
                  <div className="col-span-3">
                    <SelectMode
                      mode={editingConfig?.automation?.off?.mode ?? ""}
                      handleModeChange={(value) =>
                        setEditingConfig((prev) => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            automation: {
                              ...prev.automation,
                              on: prev.automation?.on || {
                                minutes: prev.automation?.on?.minutes ?? 0,
                                mode:
                                  prev.automation?.on?.mode ??
                                  availableModes[0],
                              },
                              off: {
                                ...(prev.automation?.off || { minutes: 0 }),
                                mode: value,
                              },
                            },
                          };
                        })
                      }
                      isLoading={isActionLoading}
                      availableModes={availableModes}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="minutesOff"
                    className="text-right text-sm font-medium"
                  >
                    Minutes Off
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="minutesOff"
                      type="number"
                      value={editingConfig?.automation?.off?.minutes ?? 0}
                      min={1}
                      onChange={(e) =>
                        setEditingConfig((prev) => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            automation: {
                              ...prev.automation,
                              off: {
                                ...(prev.automation?.off || { mode: "auto" }),
                                minutes: parseInt(e.target.value),
                              },
                              on: prev.automation?.on || {
                                minutes: 0,
                                mode: "auto",
                              },
                            },
                          };
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingConfig(null)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaveDisabled()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
