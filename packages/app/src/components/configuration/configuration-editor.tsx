import { AutomationEditor } from "@/components/configuration/automation-editor";
import { deviceConfigSchema } from "@/components/configuration/consts";
import { OverlayUpload } from "@/components/configuration/overlay-upload";
import { EditorConfig, EditorMarker } from "@/components/configuration/types";
import {
  CountrySelect,
  FlagComponent,
  PhoneInput,
} from "@/components/phone-input";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAction } from "@/hooks/use-action";
import { FileWithPreview } from "@/hooks/use-file-upload";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { updateDevice } from "@/lib/device";
import { pb } from "@/lib/pocketbase";
import { cn, getModeOptionsFromSchema } from "@/lib/utils";
import { DevicesStatusOptions } from "@/types/db.types";
import { DeviceAutomation, DeviceResponse, UpdateDevice } from "@/types/types";
import { getActiveDeviceConnection } from "@/utils/device";
import { toast } from "@/utils/toast";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import type * as Monaco from "monaco-editor";
import { useCallback, useRef, useState } from "react";
import * as RPNInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export interface ConfigurationEditorProps {
  device: DeviceResponse;
}

export function ConfigurationEditor({ device }: ConfigurationEditorProps) {
  const queryClient = useQueryClient();
  const { getActualColorMode } = useTheme();
  const isAllowedToEditConfig = useIsPermitted("edit-configuration");
  const { action, isLoading: isActionLoading } = useAction(
    device.id,
    "set-mode"
  );
  const availableModes = getModeOptionsFromSchema(action?.parameters ?? {});
  const [editingConfig, setEditingConfig] = useState<EditorConfig | null>(null);
  const [isJsonValid, setIsJsonValid] = useState(true);
  const [currentTab, setCurrentTab] = useState<
    "general" | "config" | "automation"
  >("general");
  const monacoRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [showSecondSlotFields, setShowSecondSlotFields] = useState(false);
  const { mutate: updateDeviceMutation, isPending } = useMutation({
    mutationFn: async (data: UpdateDevice) => {
      await updateDevice(data);
      if (
        (data.configuration || data.automation) &&
        device.status !== DevicesStatusOptions.off
      ) {
        setTimeout(() => {
          toast.info({
            message:
              "Device is ON, some changes may not take effect until turned OFF.",
          });
        }, 1000);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["device", device.id] });
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
        typeof on?.utcDate === "string" && typeof off?.utcDate === "string"
      );
    }
    return false;
  }, [editingConfig]);

  const isSaveDisabled = useCallback(() => {
    if (currentTab === "config") return !isJsonValid;
    if (currentTab === "automation") return !isAutomationValid();

    if (isPending) return true;

    // General tab validation
    const { host: activeHostToCheck } = editingConfig?.information
      ? getActiveDeviceConnection(editingConfig.information)
      : { host: undefined };

    return (
      !editingConfig?.name ||
      !editingConfig?.information?.user ||
      !activeHostToCheck
    );
  }, [currentTab, isJsonValid, isAutomationValid, isPending, editingConfig]);

  const handleOverlayChange = useCallback((files: FileWithPreview[]) => {
    console.log(files);
    setEditingConfig((prev) => {
      return prev
        ? { ...prev, overlay: (files?.[0]?.file as File) ?? "" }
        : null;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!editingConfig) return;

    try {
      const parsedConfig = JSON.parse(editingConfig.config);

      updateDeviceMutation({
        id: editingConfig.id,
        configuration: parsedConfig,
        automation: editingConfig.automation,
        name: editingConfig.name,
        information: editingConfig.information,
        overlay: editingConfig.overlay,
      });
    } catch {
      toast.error({
        message: "Invalid JSON configuration",
      });
    }
  }, [editingConfig, updateDeviceMutation]);

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
          const hasSecondSlotData = !!(
            device.information?.secondSlotHost ||
            device.information?.secondSlotPhone ||
            device.information?.activeSlot === "secondary"
          );
          setShowSecondSlotFields(hasSecondSlotData);

          setEditingConfig({
            id: device.id,
            config: JSON.stringify(device.configuration, null, 2),
            automation: device.automation || defaultAutomation,
            name: device.name ?? "",
            information: device.information || {
              user: "",
              password: "",
              host: "",
              phone: "",
            },
          });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] border-none">
        <DialogHeader>
          <DialogTitle>Device Settings</DialogTitle>
          <DialogDescription>
            Configure device settings, information, and automation.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          defaultValue="general"
          onValueChange={(value) =>
            setCurrentTab(value as "general" | "config" | "automation")
          }
        >
          <TabsList
            className={cn(
              "w-full",
              "grid",
              isAllowedToEditConfig ? "grid-cols-3" : "grid-cols-2"
            )}
          >
            <TabsTrigger className="w-full" value="general">
              <Label className="text-foreground">General</Label>
            </TabsTrigger>
            <TabsTrigger className="w-full" value="automation">
              <Label className="text-foreground">Automation</Label>
            </TabsTrigger>
            {isAllowedToEditConfig && (
              <TabsTrigger className="w-full" value="config">
                <Label className="text-foreground">Configuration</Label>
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent
            value="config"
            className="flex flex-col items-center gap-4"
          >
            <Editor
              height="400px"
              theme={getActualColorMode() === "dark" ? "vs-dark" : "light"}
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
            {/* <div> */}
            <OverlayUpload
              onChange={handleOverlayChange}
              overlay={pb.files.getURL(device, device?.overlay)}
            />
            {/* </div> */}
          </TabsContent>
          <TabsContent value="general" className="space-y-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Device Name</Label>
              <Input
                id="name"
                value={editingConfig?.name ?? ""}
                onChange={(e) =>
                  setEditingConfig((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="user">User</Label>
                <Input
                  id="user"
                  value={editingConfig?.information?.user ?? ""}
                  onChange={(e) =>
                    setEditingConfig((prev) =>
                      prev && prev.information
                        ? {
                            ...prev,
                            information: {
                              ...prev.information,
                              user: e.target.value,
                            },
                          }
                        : null
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={editingConfig?.information?.password ?? ""}
                  onChange={(e) =>
                    setEditingConfig((prev) =>
                      prev && prev.information
                        ? {
                            ...prev,
                            information: {
                              ...prev.information,
                              password: e.target.value,
                            },
                          }
                        : null
                    )
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="host">Host IP (Primary)</Label>
              <Input
                id="host"
                value={editingConfig?.information?.host ?? ""}
                onChange={(e) =>
                  setEditingConfig((prev) =>
                    prev && prev.information
                      ? {
                          ...prev,
                          information: {
                            ...prev.information,
                            host: e.target.value,
                          },
                        }
                      : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                placeholder="Default: 22"
                value={editingConfig?.information?.port ?? ""}
                onChange={(e) =>
                  setEditingConfig((prev) =>
                    prev && prev.information
                      ? {
                          ...prev,
                          information: {
                            ...prev.information,
                            port: e.target.value || undefined,
                          },
                        }
                      : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number (Primary)</Label>
              <RPNInput.default
                className="flex rounded-md shadow-xs"
                international
                flagComponent={FlagComponent}
                countrySelectComponent={CountrySelect}
                inputComponent={PhoneInput}
                id="phone"
                placeholder="Enter phone number"
                value={editingConfig?.information?.phone ?? ""}
                onChange={(value) =>
                  setEditingConfig((prev) =>
                    prev && prev.information
                      ? {
                          ...prev,
                          information: {
                            ...prev.information,
                            phone: value ?? "",
                          },
                        }
                      : null
                  )
                }
              />
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="show-second-slot"
                checked={showSecondSlotFields}
                onCheckedChange={(checked) => {
                  setShowSecondSlotFields(Boolean(checked));
                  setEditingConfig((prev) => {
                    if (!prev || !prev.information) return prev;
                    // If unchecking and active slot was secondary, revert to primary
                    if (
                      !checked &&
                      prev.information.activeSlot === "secondary"
                    ) {
                      return {
                        ...prev,
                        information: {
                          ...prev.information,
                          activeSlot: "primary",
                        },
                      };
                    }
                    return prev;
                  });
                }}
              />
              <Label htmlFor="show-second-slot">
                Configure Secondary Connection Slot
              </Label>
            </div>

            {showSecondSlotFields && (
              <div className="space-y-4 pl-6 border-l-2 border-muted ml-2 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="secondSlotHost">Host IP (Secondary)</Label>
                  <Input
                    id="secondSlotHost"
                    value={editingConfig?.information?.secondSlotHost ?? ""}
                    onChange={(e) =>
                      setEditingConfig((prev) =>
                        prev && prev.information
                          ? {
                              ...prev,
                              information: {
                                ...prev.information,
                                secondSlotHost: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="secondSlotPhone">
                    Phone Number (Secondary)
                  </Label>
                  <RPNInput.default
                    className="flex rounded-md shadow-xs"
                    international
                    flagComponent={FlagComponent}
                    countrySelectComponent={CountrySelect}
                    inputComponent={PhoneInput}
                    id="secondSlotPhone"
                    placeholder="Enter phone number"
                    value={editingConfig?.information?.secondSlotPhone ?? ""}
                    onChange={(value) =>
                      setEditingConfig((prev) =>
                        prev && prev.information
                          ? {
                              ...prev,
                              information: {
                                ...prev.information,
                                secondSlotPhone: value ?? "",
                              },
                            }
                          : null
                      )
                    }
                  />
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="activeSlotSecondary"
                    checked={
                      editingConfig?.information?.activeSlot === "secondary"
                    }
                    onCheckedChange={(checked) =>
                      setEditingConfig((prev) =>
                        prev && prev.information
                          ? {
                              ...prev,
                              information: {
                                ...prev.information,
                                activeSlot: checked ? "secondary" : "primary",
                              },
                            }
                          : null
                      )
                    }
                    aria-label="Set secondary slot as active"
                  />
                  <Label htmlFor="activeSlotSecondary">
                    Set as active slot
                  </Label>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="autoSlotSwitch"
                    checked={
                      editingConfig?.information?.autoSlotSwitch ?? false
                    }
                    onCheckedChange={(checked) =>
                      setEditingConfig((prev) =>
                        prev && prev.information
                          ? {
                              ...prev,
                              information: {
                                ...prev.information,
                                autoSlotSwitch: Boolean(checked),
                              },
                            }
                          : null
                      )
                    }
                    aria-label="Enable automatic slot switching"
                  />
                  <Label htmlFor="autoSlotSwitch">
                    Enable automatic slot switching
                  </Label>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="automation" className="py-4">
            <div className="grid gap-6">
              <h1 className="text-lg font-medium">Automation Settings</h1>
              <AutomationEditor
                deviceId={device.id}
                editingConfig={editingConfig}
                setEditingConfig={setEditingConfig}
                isActionLoading={isActionLoading}
                availableModes={availableModes}
              />
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
