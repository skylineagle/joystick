import { EditorConfig } from "@/components/configuration/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectMode } from "@/components/ui/select-mode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Timer } from "lucide-react";

export interface AutomationEditorProps {
  deviceId: string;
  editingConfig: EditorConfig | null;
  setEditingConfig: React.Dispatch<React.SetStateAction<EditorConfig | null>>;
  isActionLoading: boolean;
  availableModes: string[];
}
export const AutomationEditor = ({
  deviceId,
  editingConfig,
  setEditingConfig,
  isActionLoading,
  availableModes,
}: AutomationEditorProps) => {
  return (
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
                deviceId={deviceId}
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
                  if (!prev || !prev.automation || !prev.automation.on)
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
                deviceId={deviceId}
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
                    if (!prev || !prev.automation || !prev.automation.off)
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
                deviceId={deviceId}
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
                    value={editingConfig?.automation?.on?.hourOfDay ?? 0}
                    min={0}
                    max={23}
                    onChange={(e) =>
                      setEditingConfig((prev) => {
                        if (!prev || !prev.automation || !prev.automation.on)
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
                    value={editingConfig?.automation?.on?.minuteOfDay ?? 0}
                    min={0}
                    max={59}
                    onChange={(e) =>
                      setEditingConfig((prev) => {
                        if (!prev || !prev.automation || !prev.automation.on)
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
                deviceId={deviceId}
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
                    value={editingConfig?.automation?.off?.hourOfDay ?? 0}
                    min={0}
                    max={23}
                    onChange={(e) =>
                      setEditingConfig((prev) => {
                        if (!prev || !prev.automation || !prev.automation.off)
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
                    value={editingConfig?.automation?.off?.minuteOfDay ?? 0}
                    min={0}
                    max={59}
                    onChange={(e) =>
                      setEditingConfig((prev) => {
                        if (!prev || !prev.automation || !prev.automation.off)
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
  );
};
