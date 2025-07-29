import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useParamsStore } from "@/lib/params.store";
import { cn } from "@/lib/utils";
import { RotateCw } from "lucide-react";
import { DeviceValue, ParamPath, ParamValue } from "@/types/params";
import { Icon } from "@/icons/icon";

interface ParamValueEditorProps {
  schema: ParamValue;
  path: ParamPath;
  treeId: string;
}

export function ParamValueEditor({
  schema,
  path,
  treeId,
}: ParamValueEditorProps) {
  const pathStr = path.join(".");
  const displayTitle = schema.title || path[path.length - 1];

  const value =
    useParamsStore((state) => state.values[treeId]?.[pathStr]) ??
    ({
      current: null,
      edited: null,
      pending: null,
      isLoading: false,
    } as DeviceValue<string | number | boolean>);
  const { setEditedValue, commitValue, readValue } = useParamsStore();

  const handleChange = (newValue: unknown) => {
    if (schema.type === "boolean") {
      setEditedValue(treeId, path, newValue as boolean);
    } else {
      setEditedValue(treeId, path, newValue);
    }
  };

  const handleCommit = async () => {
    await commitValue(treeId, path);
  };

  const handleRefresh = async () => {
    await readValue(treeId, path, schema.type);
  };

  const renderInput = () => {
    const commonProps = {
      disabled: value.isLoading,
      className: cn(
        "min-w-full",
        value.edited !== null && "border-chart-1",
        value.pending !== null && "border-chart-4",
        value.error && "border-destructive"
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
              value.edited !== null && "bg-chart-1/10",
              value.pending !== null && "bg-chart-4/10",
              value.error && "bg-destructive/10"
            )}
            style={{ minWidth: '200px' }}
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
              <SelectTrigger
                className={cn("w-full", commonProps.className)}
                style={{ minWidth: "200px" }}
              >
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
            style={{ minWidth: "200px" }}
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
            style={{ minWidth: "200px" }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-[140px_1fr_auto] sm:grid-cols-[220px_1fr_auto] items-center gap-2 sm:gap-6 min-w-0">
      <Label
        className="text-xs sm:text-sm font-medium truncate capitalize flex-shrink-0"
        title={schema.description || displayTitle}
      >
        {displayTitle}
      </Label>
      <div className="min-w-0 overflow-hidden">
        <div className="overflow-x-auto">{renderInput()}</div>
        {value.error && (
          <p
            className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-destructive truncate"
            title={value.error}
          >
            {value.error}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {value.edited !== null ? (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCommit}
            disabled={value.isLoading}
            className="h-6 w-6 flex-shrink-0"
          >
            <Icon icon="send" style={{ width: 24, height: 24 }} />
          </Button>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRefresh}
            disabled={value.isLoading}
            className="h-6 w-6 flex-shrink-0"
          >
            <RotateCw
              className={cn("h-3.5 w-3.5", value.isLoading && "animate-spin")}
            />
          </Button>
        )}
      </div>
    </div>
  );
}
