import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAction } from "@/hooks/use-action";
import { useDevice } from "@/hooks/use-device";
import { useDeviceActions } from "@/hooks/use-device-actions";
import { inngest } from "@/lib/inngest";
import { buildZodSchema, isActionSchema } from "@/pages/actions/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  Info,
  Loader2,
  Play,
  Settings,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import { z } from "zod";

export function EnhancedTaskForm() {
  const { device: deviceId } = useParams();
  const { data: device } = useDevice(deviceId ?? "");
  const { data: actions, isLoading: isLoadingActions } = useDeviceActions(
    device?.expand?.device.id
  );
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [ttl, setTtl] = useState<number>(300);
  const queryClient = useQueryClient();
  const { action: actionData, isLoading: isLoadingAction } = useAction(
    deviceId ?? "",
    selectedAction
  );

  const actionParameters =
    actionData?.parameters && isActionSchema(actionData.parameters)
      ? actionData.parameters
      : { properties: {} };

  const zodSchema = buildZodSchema(actionParameters);
  const form = useForm<z.infer<typeof zodSchema>>({
    resolver: zodResolver(zodSchema),
  });

  const availableActions =
    actions?.filter((action): action is string => typeof action === "string") ??
    [];

  const handleSubmit = async (params: Record<string, unknown>) => {
    if (!selectedAction || !device) return;

    await inngest.send({
      name: "device/offline.action",
      data: {
        deviceId: device.id,
        deviceName: device.name,
        action: selectedAction,
        params,
        ttl,
      },
    });

    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }, 1000);

    form.reset();
    setSelectedAction("");
    setTtl(300);
  };

  const hasParameters =
    Object.keys(actionParameters.properties || {}).length > 0;

  if (isLoadingActions) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!availableActions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            No Actions Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <p className="text-muted-foreground mb-2">
              This device does not have any available actions for offline
              execution.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact your administrator to configure actions for this device.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
          },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Play className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Create Offline Task</h3>
              <p className="text-sm text-muted-foreground font-normal">
                Queue an action to run when the device comes online
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div className="space-y-3">
              <Label
                htmlFor="action"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Zap className="h-4 w-4 text-primary" />
                Action
              </Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="h-11 transition-all duration-200 hover:border-primary/50 focus:border-primary">
                  <SelectValue placeholder="Choose an action to execute" />
                </SelectTrigger>
                <SelectContent>
                  {availableActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {action}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div className="space-y-3">
              <Label
                htmlFor="ttl"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Clock className="h-4 w-4 text-primary" />
                Timeout
              </Label>
              <Input
                id="ttl"
                type="number"
                min="30"
                max="3600"
                value={ttl}
                onChange={(e) => setTtl(parseInt(e.target.value) || 300)}
                placeholder="300"
                className="h-11 transition-all duration-200 hover:border-primary/50 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Wait time for device to come online (30-3600 seconds)
              </p>
            </motion.div>
          </div>

          <AnimatePresence>
            {selectedAction && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1.5">
                      <Settings className="h-3 w-3" />
                      Action Configuration
                    </Badge>
                    {isLoadingAction && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>

                {isLoadingAction ? (
                  <motion.div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading action details...
                    </div>
                  </motion.div>
                ) : (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleSubmit)}
                      className="space-y-4"
                    >
                      {hasParameters ? (
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          {Object.entries(actionParameters.properties).map(
                            ([key, schema]) => (
                              <motion.div
                                key={key}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.1 }}
                              >
                                <FormField
                                  control={form.control}
                                  name={key}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        {key
                                          .replace(/([A-Z])/g, " $1")
                                          .replace(/^./, (str) =>
                                            str.toUpperCase()
                                          )}
                                      </FormLabel>
                                      <FormControl>
                                        {schema.type === "string" &&
                                        schema.enum ? (
                                          <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                          >
                                            <SelectTrigger className="h-11 transition-all duration-200 hover:border-primary/50 focus:border-primary">
                                              <SelectValue
                                                placeholder={`Select ${key}`}
                                              />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {schema.enum.map((option) => (
                                                <SelectItem
                                                  key={option}
                                                  value={option}
                                                >
                                                  {option}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        ) : schema.type === "boolean" ? (
                                          <div className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/30">
                                            <Switch
                                              checked={field.value}
                                              onCheckedChange={field.onChange}
                                            />
                                            <Label className="text-sm font-medium">
                                              {field.value
                                                ? "Enabled"
                                                : "Disabled"}
                                            </Label>
                                          </div>
                                        ) : schema.type === "number" ||
                                          schema.type === "integer" ? (
                                          <Input
                                            {...field}
                                            type="number"
                                            placeholder={`Enter ${key}`}
                                            className="h-11 transition-all duration-200 hover:border-primary/50 focus:border-primary"
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              const numValue =
                                                value === ""
                                                  ? undefined
                                                  : Number(value);
                                              field.onChange(numValue);
                                            }}
                                          />
                                        ) : (
                                          <Input
                                            {...field}
                                            type="text"
                                            placeholder={`Enter ${key}`}
                                            className="h-11 transition-all duration-200 hover:border-primary/50 focus:border-primary"
                                          />
                                        )}
                                      </FormControl>
                                      {schema.description && (
                                        <FormDescription>
                                          {schema.description}
                                        </FormDescription>
                                      )}
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </motion.div>
                            )
                          )}
                        </div>
                      ) : (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                            <Info className="h-5 w-5 text-primary" />
                            <span className="text-sm text-muted-foreground">
                              This action doesn't require any parameters
                            </span>
                          </div>
                        </motion.div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={!selectedAction}
                          size="lg"
                          className="h-10"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Queue Task
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
