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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateDevice } from "@/lib/device";
import { cn } from "@/lib/utils";
import { DevicesStatusOptions } from "@/types/db.types";
import { DeviceAutomation, DeviceResponse, UpdateDevice } from "@/types/types";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import type * as Monaco from "monaco-editor";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export interface ConfigurationEditorProps {
  device: DeviceResponse;
}

export function ConfigurationEditor({ device }: ConfigurationEditorProps) {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
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
      toast.success("Device updated successfully");
      setEditingConfig(null);
    },
    onError: (error) => {
      toast.error("Failed to update device: " + error.message);
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
    const { minutesOn, minutesOff } = editingConfig.automation;
    return minutesOn > 0 && minutesOff > 0;
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
        toast.error("Invalid JSON configuration");
      }
    } else {
      if (!isAutomationValid()) {
        toast.error("Minutes On and Minutes Off must be greater than 0");
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
          <TabsList className={cn("w-full", "grid grid-cols-2")}>
            <TabsTrigger className="w-full" value="general">
              <Label className="text-foreground">General</Label>
            </TabsTrigger>
            <TabsTrigger className="w-full" value="config">
              <Label className="text-foreground">Configuration</Label>
            </TabsTrigger>
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
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="name"
                  className="text-right text-sm font-medium"
                >
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  className="col-span-3"
                  value={editingConfig?.name ?? ""}
                  onChange={(e) =>
                    setEditingConfig((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                />
              </div>
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
                  value={editingConfig?.automation?.minutesOn ?? 0}
                  min={1}
                  onChange={(e) =>
                    setEditingConfig((prev) => ({
                      ...prev!,
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
                  value={editingConfig?.automation?.minutesOff ?? 0}
                  min={1}
                  onChange={(e) =>
                    setEditingConfig((prev) => ({
                      ...prev!,
                      automation: {
                        minutesOn: prev?.automation?.minutesOn ?? 0,
                        minutesOff: parseInt(e.target.value),
                      },
                    }))
                  }
                />
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
