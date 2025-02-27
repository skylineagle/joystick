/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { pb } from "@/lib/pocketbase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ActionFormProps {
  action: string;
  onSubmit: (params: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export function ActionForm({
  action,
  onSubmit,
  isSubmitting,
}: ActionFormProps) {
  const { data: actionSchema, isLoading } = useQuery({
    queryKey: ["action-schema", action],
    queryFn: async () => {
      const result = await pb
        .collection("actions")
        .getFirstListItem(`name = "${action}"`);
      return result.params as Record<string, any> | undefined;
    },
  });
  const zodSchema = buildZodSchema(actionSchema ?? {});
  const form = useForm<z.infer<typeof zodSchema>>({
    resolver: zodResolver(zodSchema),
  });

  if (isLoading) {
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

  if (!actionSchema) {
    return (
      <Card className="border-none">
        <CardHeader>
          <CardTitle>No Parameters Required</CardTitle>
          <CardDescription>
            This action can be executed without any parameters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => onSubmit({})} disabled={isSubmitting}>
            {isSubmitting ? "Executing..." : "Execute Action"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Action Parameters</CardTitle>
            <CardDescription>
              Configure the parameters for this action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(actionSchema.properties || {}).map(
              ([name, schema]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
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

function buildZodSchema(schema: Record<string, any>): z.ZodType {
  const properties: Record<string, z.ZodType> = {};

  Object.entries(schema.properties || {}).forEach(
    ([key, value]: [string, any]) => {
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
          properties[key] = z.boolean();
          break;
        default:
          properties[key] = z.any();
      }

      if (!schema.required?.includes(key)) {
        properties[key] = properties[key].optional();
      }
    }
  );

  return z.object(properties);
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
