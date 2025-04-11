import { EditorConfig } from "@/components/configuration/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectMode } from "@/components/ui/select-mode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Timer } from "lucide-react";
import { useId } from "react";
import { withMask } from "use-mask-input";

function convertTimeToUTCHHMM(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const now = new Date();
  const localDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );
  const utcHours = localDate.getUTCHours().toString().padStart(2, "0");
  const utcMinutes = localDate.getUTCMinutes().toString().padStart(2, "0");
  return `${utcHours}:${utcMinutes}`;
}

function convertUTCToLocalHHMM(utcTime: string): string {
  const [hours, minutes] = utcTime.split(":").map(Number);

  // Create a UTC date using today's date and the given time
  const utcDate = new Date(
    Date.UTC(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      hours,
      minutes
    )
  );

  // Convert to local time
  const localHours = utcDate.getHours().toString().padStart(2, "0");
  const localMinutes = utcDate.getMinutes().toString().padStart(2, "0");

  return `${localHours}:${localMinutes}`;
}

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
  const onId = useId();
  const offId = useId();

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
                <Input
                  id={onId}
                  placeholder="00:00"
                  type="text"
                  ref={withMask("99:99", {
                    placeholder: "-",
                    showMaskOnHover: false,
                  })}
                  defaultValue={convertUTCToLocalHHMM(
                    editingConfig?.automation?.on?.utcDate ?? ""
                  )}
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
                            utcDate: convertTimeToUTCHHMM(e.target.value),
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
                <Input
                  id={offId}
                  placeholder="00:00"
                  type="text"
                  ref={withMask("99:99", {
                    placeholder: "-",
                    showMaskOnHover: false,
                  })}
                  defaultValue={convertUTCToLocalHHMM(
                    editingConfig?.automation?.off?.utcDate ?? ""
                  )}
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
                            utcDate: convertTimeToUTCHHMM(e.target.value),
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
  );
};
