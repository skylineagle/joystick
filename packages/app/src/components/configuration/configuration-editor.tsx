import { AutomationEditor } from "@/components/configuration/automation-editor";
import { deviceConfigSchema } from "@/components/configuration/consts";
import { EditorConfig, EditorMarker } from "@/components/configuration/types";
import {
  CountrySelect,
  FlagComponent,
  PhoneInput,
} from "@/components/phone-input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAction } from "@/hooks/use-action";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { updateDevice } from "@/lib/device";
import { cn, getModeOptionsFromSchema } from "@/lib/utils";
import { DevicesStatusOptions } from "@/types/db.types";
import {
  DeviceAutomation,
  DeviceInformation,
  DeviceResponse,
  UpdateDevice,
} from "@/types/types";
import { toast } from "@/utils/toast";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import type * as Monaco from "monaco-editor";
import { useCallback, useRef, useState } from "react";
import * as RPNInput from "react-phone-number-input";

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
    if (currentTab === "automation") return !isAutomationValid();

    // General tab validation
    return (
      !editingConfig?.name ||
      !editingConfig?.information?.user ||
      !editingConfig?.information?.password ||
      !editingConfig?.information?.host
    );
  }, [currentTab, isJsonValid, isAutomationValid, editingConfig]);

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
        <Button
          variant="ghost"
          size="icon"
          disabled={device.status !== DevicesStatusOptions.off}
        >
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
          <TabsContent value="config" className="py-4">
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
          </TabsContent>
          <TabsContent value="general" className="py-4">
            <div className="space-y-6">
              <div className="grid gap-4 grid-cols-2">
                <div className="grid gap-2">
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
                <div className="grid gap-2">
                  <Label htmlFor="deviceId" className="text-sm font-medium">
                    Device ID
                  </Label>
                  <Input
                    id="deviceId"
                    type="text"
                    value={(() => {
                      if (!editingConfig?.config) return "";
                      try {
                        const config = JSON.parse(editingConfig.config);
                        return config.name || "";
                      } catch {
                        return "";
                      }
                    })()}
                    onChange={(e) => {
                      if (!editingConfig) return;
                      try {
                        const config = JSON.parse(editingConfig.config);
                        config.name = e.target.value;
                        setEditingConfig({
                          ...editingConfig,
                          config: JSON.stringify(config, null, 2),
                        });
                      } catch {
                        toast.error({
                          message: "Invalid JSON configuration",
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2 pt-8">
                <div className="grid gap-2">
                  <Label htmlFor="user" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="user"
                    type="text"
                    value={editingConfig?.information?.user ?? ""}
                    onChange={(e) =>
                      setEditingConfig((prev) =>
                        prev
                          ? {
                              ...prev,
                              information: {
                                ...(prev.information as DeviceInformation),
                                user: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={editingConfig?.information?.password ?? ""}
                    onChange={(e) =>
                      setEditingConfig((prev) =>
                        prev
                          ? {
                              ...prev,
                              information: {
                                ...(prev.information as DeviceInformation),
                                password: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="host" className="text-sm font-medium">
                    IP Address
                  </Label>
                  <Input
                    id="host"
                    type="text"
                    value={editingConfig?.information?.host ?? ""}
                    onChange={(e) =>
                      setEditingConfig((prev) =>
                        prev
                          ? {
                              ...prev,
                              information: {
                                ...(prev.information as DeviceInformation),
                                host: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
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
                        prev
                          ? {
                              ...prev,
                              information: {
                                ...(prev.information as DeviceInformation),
                                phone: value ?? "",
                              },
                            }
                          : null
                      )
                    }
                  />
                </div>
              </div>
            </div>
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
