/* eslint-disable @typescript-eslint/no-explicit-any */
import { RippleButton } from "@/components/animate-ui/buttons/ripple";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { buildZodSchema } from "@/pages/actions/utils";
import { ActionSchema } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ActionFormProps {
  deviceId?: string;
  action: string;
  onSubmit: (params: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export function ActionForm({
  deviceId,
  action,
  onSubmit,
  isSubmitting,
}: ActionFormProps) {
  const { action: actionData, isLoading } = useAction(deviceId ?? "", action);
  const zodSchema = buildZodSchema(
    actionData?.parameters ?? ({ properties: {} } as ActionSchema)
  );
  const form = useForm<z.infer<typeof zodSchema>>({
    resolver: zodResolver(zodSchema),
  });

  if (!deviceId || isLoading) {
    return (
      <Card className="border-none">
        <CardHeader>
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!actionData?.parameters) {
    return (
      <Card className="border-none">
        <CardHeader>
          <CardTitle>No Parameters Required</CardTitle>
          <CardDescription>
            This action can be executed without any parameters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RippleButton onClick={() => onSubmit({})} disabled={isSubmitting}>
            {isSubmitting ? "Executing..." : "Execute Action"}
          </RippleButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Action Parameters</CardTitle>
            <CardDescription>
              Configure the parameters for this action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(actionData?.parameters.properties || {}).map(
              ([name, schema]) => (
                <FormField
                  key={name}
                  control={form.control}
                  defaultValue={schema.default}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel className="capitalize">
                        {name.replace(/-/g, " ")}
                      </FormLabel>
                      {renderField(schema, field)}
                      <FormDescription>
                        {
                          (schema as unknown as { description?: string })
                            ?.description
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Executing..." : "Execute Action"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

function renderField(schema: any, field: any) {
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
