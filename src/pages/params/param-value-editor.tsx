import { ParamPath, ParamValue, DeviceValue } from "@/types/params";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useParamsStore } from "@/lib/params.store";
import { Button } from "@/components/ui/button";
import { Send, RotateCw } from "lucide-react";

interface ParamValueEditorProps {
  schema: ParamValue;
  path: ParamPath;
}

export function ParamValueEditor({ schema, path }: ParamValueEditorProps) {
  const pathStr = path.join(".");
  const value =
    useParamsStore((state) => state.values[pathStr]) ??
    ({
      current: null,
      edited: null,
      pending: null,
      isLoading: false,
    } as DeviceValue<string | number | boolean>);
  const { setEditedValue, commitValue, readValue } = useParamsStore();

  const handleChange = (newValue: unknown) => {
    if (schema.type === "boolean") {
      setEditedValue(path, newValue as boolean);
    } else {
      setEditedValue(path, newValue);
    }
  };

  const handleCommit = async () => {
    await commitValue(path);
  };

  const handleRefresh = async () => {
    await readValue(path);
  };

  const renderInput = () => {
    const commonProps = {
      disabled: value.isLoading,
      className: cn(
        "w-full",
        value.edited !== null && "border-blue-500",
        value.pending !== null && "border-yellow-500",
        value.error && "border-red-500"
      ),
    };

    switch (schema.type) {
      case "boolean": {
        const currentValue =
          value.edited !== null ? value.edited : value.current;
        return (
          <div
            className={cn(
              "flex h-9 items-center rounded-md px-3",
              value.edited !== null && "bg-blue-500/10",
              value.pending !== null && "bg-yellow-500/10",
              value.error && "bg-red-500/10"
            )}
          >
            <Switch
              checked={Boolean(currentValue)}
              onCheckedChange={handleChange}
              disabled={value.isLoading}
            />
          </div>
        );
      }

      case "string":
        if (schema.enum) {
          return (
            <Select
              value={(value.edited ?? value.current)?.toString() ?? ""}
              onValueChange={handleChange}
              disabled={value.isLoading}
            >
              <SelectTrigger className={cn("w-full", commonProps.className)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {schema.enum.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return (
          <Input
            value={(value.edited ?? value.current)?.toString() ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            {...commonProps}
          />
        );

      case "number":
      case "integer":
        return (
          <Input
            type="number"
            value={(value.edited ?? value.current)?.toString() ?? ""}
            onChange={(e) => handleChange(Number(e.target.value))}
            min={schema.minimum}
            max={schema.maximum}
            step={schema.type === "integer" ? 1 : "any"}
            {...commonProps}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-[200px_1fr_auto] items-start gap-6">
      <Label className="text-base font-medium py-2.5 text-left">
        {schema.title}
      </Label>
      <div className="min-w-[220px]">
        {renderInput()}
        {value.error && (
          <p className="mt-1.5 text-sm text-red-500">{value.error}</p>
        )}
      </div>
      <div className="flex items-center gap-2 py-1.5">
        {value.edited !== null ? (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCommit}
            disabled={value.isLoading}
            className="h-8 w-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRefresh}
            disabled={value.isLoading}
            className="h-8 w-8"
          >
            <RotateCw
              className={cn("h-4 w-4", value.isLoading && "animate-spin")}
            />
          </Button>
        )}
      </div>
    </div>
  );
}
