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
import { Clock, Pencil, Timer } from "lucide-react";
import type * as Monaco from "monaco-editor";
import { useCallback, useRef, useState } from "react";

export interface ConfigurationEditorProps {
  device: DeviceResponse;
}

export function ConfigurationEditor({ device }: ConfigurationEditorProps) {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isAllowedToEditConfig = useIsPermitted("edit-configuration");
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
    const { automationType, on, off } = editingConfig.automation;

    if (automationType === "duration") {
      return (on?.minutes || 0) > 0 && (off?.minutes || 0) > 0;
    } else if (automationType === "timeOfDay") {
      return (
        typeof on?.hourOfDay === "number" &&
        typeof off?.hourOfDay === "number" &&
        typeof on?.minuteOfDay === "number" &&
        typeof off?.minuteOfDay === "number"
      );
    }
    return false;
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
        const { automationType } = editingConfig.automation || {
          automationType: "duration",
        };

        if (automationType === "duration") {
          toast.error({
            message: "On and Off minutes must be greater than 0",
          });
        } else {
          toast.error({
            message:
              "Please set valid hour and minute values for both On and Off times",
          });
        }
        return;
      }

      updateDeviceMutation({
        id: editingConfig.id,
        configuration: JSON.parse(editingConfig.config),
        automation: editingConfig.automation || "duration",
        name: editingConfig.name,
      });
    }
  }, [editingConfig, currentTab, updateDeviceMutation, isAutomationValid]);

  return (
    <Dialog
      open={editingConfig?.id === device.id}
      onOpenChange={(open: boolean) => {
        if (!open) setEditingConfig(null);
        else {
          const defaultAutomation: DeviceAutomation = {
            automationType: "duration",
            on: { minutes: 0, mode: availableModes[0] || "auto" },
            off: { minutes: 0, mode: availableModes[0] || "auto" },
          };

          setEditingConfig({
            id: device.id,
            config: JSON.stringify(device.configuration, null, 2),
            automation: device.automation || defaultAutomation,
            name: device.name ?? "",
          });
        }
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

              <h1 className="text-lg font-medium">Automation</h1>

              <Tabs
                defaultValue="duration"
                value={editingConfig?.automation?.automationType}
                onValueChange={(v) =>
                  setEditingConfig((prev) => {
                    if (!prev || !prev.automation) return null;
                    return {
                      ...prev,
                      automation: {
                        ...prev.automation,
                        automationType: v as "duration" | "timeOfDay",
                      },
                    };
                  })
                }
              >
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="duration" className="text-xs gap-2">
                    <Timer className="h-4 w-4" /> Duration
                  </TabsTrigger>
                  <TabsTrigger value="timeOfDay" className="text-xs gap-2">
                    <Clock className="h-4 w-4" /> Time of Day
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="duration" className="pt-6">
                  <div className="space-y-4">
                    <div className="flex flex-row items-center gap-3">
                      <div className="flex items-center gap-3">
                        <SelectMode
                          deviceId={device.id}
                          mode={editingConfig?.automation?.on?.mode ?? ""}
                          handleModeChange={(value) =>
                            setEditingConfig((prev) => {
                              if (!prev || !prev.automation) return null;

                              const defaultOnSettings = {
                                minutes: 0,
                                mode: value,
                              };
                              const currentOnSettings =
                                prev.automation.on || defaultOnSettings;

                              return {
                                ...prev,
                                automation: {
                                  ...prev.automation,
                                  on: {
                                    ...currentOnSettings,
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
                      <Label className="text-sm font-medium">For:</Label>

                      <Input
                        id="minutesOn"
                        type="number"
                        value={editingConfig?.automation?.on?.minutes ?? 0}
                        min={1}
                        className="w-full"
                        onChange={(e) =>
                          setEditingConfig((prev) => {
                            if (
                              !prev ||
                              !prev.automation ||
                              !prev.automation.on
                            )
                              return null;
                            return {
                              ...prev,
                              automation: {
                                ...prev.automation,
                                on: {
                                  ...prev.automation.on,
                                  minutes: parseInt(e.target.value),
                                },
                              },
                            };
                          })
                        }
                      />

                      <Label className="text-sm font-medium">minutes</Label>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <h3 className="text-md font-medium">Then</h3>
                    <div className="flex flex-row items-center gap-3">
                      <div className="flex items-center gap-3">
                        <SelectMode
                          deviceId={device.id}
                          mode={editingConfig?.automation?.off?.mode ?? ""}
                          handleModeChange={(value) =>
                            setEditingConfig((prev) => {
                              if (!prev || !prev.automation) return null;

                              const defaultOffSettings = {
                                minutes: 0,
                                mode: value,
                              };
                              const currentOffSettings =
                                prev.automation.off || defaultOffSettings;

                              return {
                                ...prev,
                                automation: {
                                  ...prev.automation,
                                  off: {
                                    ...currentOffSettings,
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
                      <Label className="text-sm font-medium">For:</Label>
                      <div className="flex-1">
                        <Input
                          id="minutesOff"
                          type="number"
                          value={editingConfig?.automation?.off?.minutes ?? 0}
                          min={1}
                          className="w-full"
                          onChange={(e) =>
                            setEditingConfig((prev) => {
                              if (
                                !prev ||
                                !prev.automation ||
                                !prev.automation.off
                              )
                                return null;
                              return {
                                ...prev,
                                automation: {
                                  ...prev.automation,
                                  off: {
                                    ...prev.automation.off,
                                    minutes: parseInt(e.target.value),
                                  },
                                },
                              };
                            })
                          }
                        />
                      </div>
                      <Label className="text-sm font-medium">minutes</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeOfDay" className="pt-6">
                  <div className="space-y-4">
                    <div className="flex flex-row items-center gap-3">
                      <div className="flex items-center gap-3">
                        <SelectMode
                          deviceId={device.id}
                          mode={editingConfig?.automation?.on?.mode ?? ""}
                          handleModeChange={(value) =>
                            setEditingConfig((prev) => {
                              if (!prev || !prev.automation) return null;

                              const defaultOnSettings = {
                                mode: value,
                                hourOfDay: 0,
                                minuteOfDay: 0,
                              };
                              const currentOnSettings =
                                prev.automation.on || defaultOnSettings;

                              return {
                                ...prev,
                                automation: {
                                  ...prev.automation,
                                  on: {
                                    ...currentOnSettings,
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

                      <div className="flex items-center gap-3">
                        <Label className="text-sm font-medium">At:</Label>
                        <div className="flex-1 flex gap-2 items-center">
                          <div className="w-1/2">
                            <Input
                              id="hourOn"
                              type="number"
                              placeholder="Hour (0-23)"
                              value={
                                editingConfig?.automation?.on?.hourOfDay ?? 0
                              }
                              min={0}
                              max={23}
                              onChange={(e) =>
                                setEditingConfig((prev) => {
                                  if (
                                    !prev ||
                                    !prev.automation ||
                                    !prev.automation.on
                                  )
                                    return null;
                                  return {
                                    ...prev,
                                    automation: {
                                      ...prev.automation,
                                      on: {
                                        ...prev.automation.on,
                                        hourOfDay: parseInt(e.target.value),
                                      },
                                    },
                                  };
                                })
                              }
                            />
                          </div>
                          <span>:</span>
                          <div className="w-1/2">
                            <Input
                              id="minuteOn"
                              type="number"
                              placeholder="Minute (0-59)"
                              value={
                                editingConfig?.automation?.on?.minuteOfDay ?? 0
                              }
                              min={0}
                              max={59}
                              onChange={(e) =>
                                setEditingConfig((prev) => {
                                  if (
                                    !prev ||
                                    !prev.automation ||
                                    !prev.automation.on
                                  )
                                    return null;
                                  return {
                                    ...prev,
                                    automation: {
                                      ...prev.automation,
                                      on: {
                                        ...prev.automation.on,
                                        minuteOfDay: parseInt(e.target.value),
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
                  </div>

                  <div className="space-y-4 mt-6">
                    <h3 className="text-md font-medium">Then</h3>
                    <div className="flex flex-row items-center gap-3">
                      <div className="flex items-center gap-3">
                        <SelectMode
                          deviceId={device.id}
                          mode={editingConfig?.automation?.off?.mode ?? ""}
                          handleModeChange={(value) =>
                            setEditingConfig((prev) => {
                              if (!prev || !prev.automation) return null;

                              const defaultOffSettings = {
                                mode: value,
                                hourOfDay: 0,
                                minuteOfDay: 0,
                              };
                              const currentOffSettings =
                                prev.automation.off || defaultOffSettings;

                              return {
                                ...prev,
                                automation: {
                                  ...prev.automation,
                                  off: {
                                    ...currentOffSettings,
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

                      <div className="flex items-center gap-3">
                        <Label className="text-sm font-medium">At:</Label>
                        <div className="flex-1 flex gap-2 items-center">
                          <div className="w-1/2">
                            <Input
                              id="hourOff"
                              type="number"
                              placeholder="Hour (0-23)"
                              value={
                                editingConfig?.automation?.off?.hourOfDay ?? 0
                              }
                              min={0}
                              max={23}
                              onChange={(e) =>
                                setEditingConfig((prev) => {
                                  if (
                                    !prev ||
                                    !prev.automation ||
                                    !prev.automation.off
                                  )
                                    return null;
                                  return {
                                    ...prev,
                                    automation: {
                                      ...prev.automation,
                                      off: {
                                        ...prev.automation.off,
                                        hourOfDay: parseInt(e.target.value),
                                      },
                                    },
                                  };
                                })
                              }
                            />
                          </div>
                          <span>:</span>
                          <div className="w-1/2">
                            <Input
                              id="minuteOff"
                              type="number"
                              placeholder="Minute (0-59)"
                              value={
                                editingConfig?.automation?.off?.minuteOfDay ?? 0
                              }
                              min={0}
                              max={59}
                              onChange={(e) =>
                                setEditingConfig((prev) => {
                                  if (
                                    !prev ||
                                    !prev.automation ||
                                    !prev.automation.off
                                  )
                                    return null;
                                  return {
                                    ...prev,
                                    automation: {
                                      ...prev.automation,
                                      off: {
                                        ...prev.automation.off,
                                        minuteOfDay: parseInt(e.target.value),
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
                  </div>
                </TabsContent>
              </Tabs>
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
