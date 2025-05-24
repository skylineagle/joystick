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
  schema: ParamNode | ParamValue;
  path: ParamPath;
  expanded: Set<string>;
  onToggle: (path: ParamPath) => void;
  treeId: string;
}

export function ParamTree({
  schema,
  path,
  expanded,
  onToggle,
  treeId,
}: ParamTreeProps) {
  const pathStr = path.join(".");
  const isExpanded = expanded.has(pathStr);
  const { values, readValue } = useParamsStore();
  const treeValues = values[treeId] || {};

  // Get display title - use schema title, last path segment, or "Root" for empty path
  const displayTitle =
    schema.title || (path.length > 0 ? path[path.length - 1] : "Parameters");

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
      await Promise.all(
        childPaths.map((childPath) => {
          // Get the parameter schema to determine its type
          let paramSchema = schema;
          for (const segment of childPath) {
            if (
              paramSchema.type === "object" &&
              typeof paramSchema.properties === "object" &&
              paramSchema.properties !== null &&
              Object.prototype.hasOwnProperty.call(
                paramSchema.properties,
                segment
              )
            ) {
              paramSchema = paramSchema.properties[segment] as ParamNode;
            }
          }
          return readValue(treeId, childPath, paramSchema.type as string);
        })
      );
    }
  };

  if (schema.type === "object") {
    return (
      <div className="space-y-1">
        <div className="flex items-center">
          <div
            className={cn(
              "w-full flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md cursor-pointer",
              "hover:bg-accent hover:text-accent-foreground transition-colors duration-200",
              "group/param-header",
              path.length === 0 &&
                "text-base sm:text-lg font-medium bg-muted/30",
              path.length === 1 && "text-sm font-medium bg-muted/20",
              path.length > 1 && "text-sm bg-muted/10"
            )}
            onClick={() => onToggle(path)}
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-transform duration-200",
                "text-muted-foreground/70 group-hover/param-header:text-accent-foreground",
                isExpanded && "rotate-90"
              )}
            />
            <span
              className={cn(
                "truncate capitalize",
                !schema.title && "text-muted-foreground/90",
                path.length === 0 && "font-medium",
                path.length === 1 && "font-medium text-foreground/90",
                path.length > 1 && "text-foreground/80"
              )}
              title={schema.description || displayTitle}
            >
              {displayTitle}
            </span>
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
          <div
            className={cn(
              "relative pl-3 sm:pl-4 mt-1 space-y-1",
              path.length === 0 && "pl-1 sm:pl-2",
              path.length > 0 && [
                "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px",
                "before:bg-border/50 hover:before:bg-border/80",
                "before:rounded-sm",
              ]
            )}
          >
            {Object.entries(schema.properties).map(([key, value]) => (
              <ParamTree
                key={key}
                schema={value}
                path={[...path, key]}
                expanded={expanded}
                onToggle={onToggle}
                treeId={treeId}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const value = treeValues[pathStr];
  const isEdited = Boolean(value?.edited);
  const isLoading = Boolean(value?.isLoading);

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-md",
        "hover:bg-accent/5 transition-colors duration-200",
        "relative"
      )}
    >
      <ParamValueEditor schema={schema} path={path} treeId={treeId} />
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
                "bg-chart-1/10 text-chart-1 hover:bg-chart-1/20",
              !isLoading &&
                isActive &&
                status === "current" &&
                "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20"
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
