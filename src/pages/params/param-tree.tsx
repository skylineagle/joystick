import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useParamsStore } from "@/lib/params.store";
import { cn } from "@/lib/utils";
import { ParamValueEditor } from "@/pages/params/param-value-editor";
import { ParamNode, ParamPath, ParamValue } from "@/types/params";
import { Check, ChevronRight, PencilLine, RotateCw } from "lucide-react";

interface ParamTreeProps {
  schema: any;
  path: ParamPath;
  expanded: Set<string>;
  onToggle: (path: ParamPath) => void;
}

export function ParamTree({
  schema,
  path,
  expanded,
  onToggle,
}: ParamTreeProps) {
  const pathStr = path.join(".");
  const isExpanded = expanded.has(pathStr);
  const { values, readValue } = useParamsStore();

  const handleRereadSection = async () => {
    if (schema.type === "object") {
      // Get all child parameter paths
      const childPaths: ParamPath[] = [];
      const collectPaths = (
        node: ParamNode | ParamValue,
        currentPath: ParamPath
      ) => {
        if (node.type === "object") {
          Object.entries(node.properties).forEach(([key, value]) => {
            collectPaths(value, [...currentPath, key]);
          });
        } else {
          childPaths.push(currentPath);
        }
      };
      collectPaths(schema, path);

      // Read all child parameters
      await Promise.all(childPaths.map(readValue));
    }
  };

  if (schema.type === "object") {
    return (
      <div className="space-y-1">
        <div className="flex items-center">
          <div
            className={cn(
              "w-full flex items-center gap-1.5 sm:gap-2 font-normal text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground",
              path.length === 0 && "text-base sm:text-lg"
            )}
            onClick={() => onToggle(path)}
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-transform",
                isExpanded && "rotate-90"
              )}
            />
            <span className="text-xs sm:text-sm truncate">{schema.title}</span>
            {path.length === 1 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 sm:h-5 sm:w-5 p-0 ml-1 sm:ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRereadSection();
                      }}
                    >
                      <RotateCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs sm:text-sm">
                    <p>Reread all values in this section</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="ml-2 sm:ml-4 border-l pl-2 sm:pl-4">
            {Object.entries(schema.properties).map(([key, value]) => (
              <ParamTree
                key={key}
                schema={value}
                path={[...path, key]}
                expanded={expanded}
                onToggle={onToggle}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const value = values[pathStr];
  const isEdited = Boolean(value?.edited);
  const isLoading = Boolean(value?.isLoading);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 py-1">
      <ParamValueEditor schema={schema} path={path} />
      <div className="flex items-center gap-1">
        {isEdited ? (
          <ValueIndicator
            status="edited"
            isActive={true}
            isLoading={isLoading}
          />
        ) : (
          <ValueIndicator
            status="current"
            isActive={Boolean(value?.current)}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

interface ValueIndicatorProps {
  status: "edited" | "pending" | "current";
  isActive?: boolean;
  isLoading?: boolean;
}

function ValueIndicator({
  status,
  isActive = false,
  isLoading = false,
}: ValueIndicatorProps) {
  const tooltipContent = {
    edited: "Value has been edited but not saved",
    pending: "Value is pending update from device",
    current: "Current value on device",
  }[status];

  const StatusIcon = {
    edited: PencilLine,
    pending: RotateCw,
    current: Check,
  }[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-200",
              !isLoading && !isActive && "bg-muted text-muted-foreground/50",
              !isLoading &&
                isActive &&
                status === "edited" &&
                "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
              !isLoading &&
                isActive &&
                status === "current" &&
                "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-1.5">
          <StatusIcon className="h-3.5 w-3.5" />
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
