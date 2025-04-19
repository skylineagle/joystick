import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAction } from "@/hooks/use-action";
import { useActions } from "@/hooks/use-actions";
import type { ActionRunnerCardConfig } from "@/types/dashboard-cards";
import { zodResolver } from "@hookform/resolvers/zod";
import { Play } from "lucide-react";
import { useState } from "react";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { z } from "zod";
import { BaseCard } from "./base-card";

interface ActionRunnerCardProps {
  config: ActionRunnerCardConfig;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
}

interface SchemaProperty {
  type: string;
  enum?: string[];
  default?: unknown;
  description?: string;
}

interface ActionSchema {
  properties: Record<string, SchemaProperty>;
  required?: string[];
}

function buildZodSchema(schema: ActionSchema): z.ZodType {
  const properties: Record<string, z.ZodType> = {};

  Object.entries(schema.properties || {}).forEach(([key, value]) => {
    switch (value.type) {
      case "string":
        properties[key] = z.string();
        if (value.enum)
          properties[key] = z.enum(value.enum as [string, ...string[]]);
        break;
      case "number":
        properties[key] = z.number();
        break;
      case "integer":
        properties[key] = z.number().int();
        break;
      case "boolean":
        properties[key] = z.boolean().default(false);
        break;
      default:
        properties[key] = z.any();
    }

    if (!schema.required?.includes(key)) {
      properties[key] = properties[key].optional();
    }
  });

  return z.object(properties);
}

function renderField(schema: SchemaProperty, field: ControllerRenderProps) {
  switch (schema.type) {
    case "string":
      if (schema.enum) {
        return (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {schema.enum.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      return (
        <FormControl>
          <Input {...field} />
        </FormControl>
      );

    case "number":
    case "integer":
      return (
        <FormControl>
          <Input
            type="number"
            {...field}
            onChange={(e) => field.onChange(e.target.valueAsNumber)}
          />
        </FormControl>
      );

    case "boolean":
      return (
        <FormControl>
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        </FormControl>
      );

    default:
      return (
        <FormControl>
          <Input {...field} />
        </FormControl>
      );
  }
}

function isActionSchema(obj: unknown): obj is ActionSchema {
  if (!obj || typeof obj !== "object") return false;
  const schema = obj as Record<string, unknown>;
  return "properties" in schema && typeof schema.properties === "object";
}

export const ActionRunnerCard = ({
  config,
  isEditing,
  onEdit,
}: ActionRunnerCardProps) => {
  const [selectedAction, setSelectedAction] = useState<string>(
    config.actionId ?? ""
  );
  const { actions, isLoading, runAction, isRunning, actionResult } = useActions(
    config.deviceId
  );
  const { action: actionData } = useAction(config.deviceId, selectedAction);

  const actionParameters =
    actionData?.parameters && isActionSchema(actionData.parameters)
      ? actionData.parameters
      : { properties: {} };

  const zodSchema = buildZodSchema(actionParameters);
  const form = useForm<z.infer<typeof zodSchema>>({
    resolver: zodResolver(zodSchema),
  });

  const handleRunAction = (params: Record<string, unknown>) => {
    if (selectedAction === "") return;
    runAction({ action: selectedAction, params });
  };

  const availableActions =
    actions?.filter((action): action is string => typeof action === "string") ??
    [];

  return (
    <BaseCard config={config} isEditing={isEditing} onEdit={onEdit}>
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-2">
          <Select
            value={selectedAction}
            onValueChange={setSelectedAction}
            disabled={isLoading || isRunning}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select an action" />
            </SelectTrigger>
            <SelectContent>
              {availableActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedAction && actionData?.parameters && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleRunAction)}
              className="space-y-4"
            >
              {Object.entries(actionData.parameters.properties || {}).map(
                ([name, schema]) => (
                  <FormField
                    key={name}
                    control={form.control}
                    defaultValue={schema.default}
                    name={name}
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel className="capitalize">
                          {name.replace(/-/g, " ")}
                        </FormLabel>
                        {renderField(schema, field)}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              )}
              <Button
                type="submit"
                disabled={!selectedAction || selectedAction === "" || isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <div className="animate-spin">⏳</div>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}

        {selectedAction && !actionData?.parameters && (
          <Button
            onClick={() => handleRunAction({})}
            disabled={!selectedAction || selectedAction === "" || isRunning}
            className="w-full"
          >
            {isRunning ? (
              <div className="animate-spin">⏳</div>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run
              </>
            )}
          </Button>
        )}

        {actionResult && (
          <Alert>
            <AlertDescription className="font-mono text-xs">
              {actionResult}
            </AlertDescription>
          </Alert>
        )}

        {!actions?.length && !isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground italic">
              No actions available for this device
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground italic">
              Loading actions...
            </p>
          </div>
        )}
      </div>
    </BaseCard>
  );
};
