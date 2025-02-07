import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParamsStore } from "@/lib/params.store";
import { cn } from "@/lib/utils";
import { ParamTree } from "@/pages/params/param-tree";
import { ParamNode, ParamPath } from "@/types/params";
import { RotateCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Mock schema - replace with actual schema from device
const mockSchema: ParamNode = {
  type: "object",
  title: "Device Parameters",
  properties: {
    video: {
      type: "object",
      title: "Video Settings",
      properties: {
        bitrate: {
          type: "number",
          title: "Bitrate",
          minimum: 100,
          maximum: 10000,
        },
        resolution: {
          type: "string",
          title: "Resolution",
          enum: ["1080p", "720p", "480p"],
        },
        mode: {
          type: "string",
          title: "Mode",
          enum: ["LIVE", "VMD", "CMD"],
        },
        fps: {
          type: "number",
          title: "FPS",
          minimum: 1,
          maximum: 60,
        },
        enable: {
          type: "boolean",
          title: "Enable",
        },
      },
    },
    network: {
      type: "object",
      title: "Network Settings",
      properties: {
        ipAddress: {
          type: "string",
          title: "IP Address",
        },
        port: {
          type: "integer",
          title: "Port",
          minimum: 1,
          maximum: 65535,
        },
      },
    },
  },
};

function initializeValues(
  node: ParamNode,
  path: ParamPath = [],
  values: Record<string, null> = {}
) {
  Object.entries(node.properties).forEach(([key, value]) => {
    const currentPath = [...path, key];
    if (value.type === "object") {
      initializeValues(value, currentPath, values);
    } else {
      values[currentPath.join(".")] = null;
    }
  });
  return values;
}

export function ParamsPage() {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set([]));
  const { readAllValues } = useParamsStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleToggle = useCallback((path: ParamPath) => {
    setExpandedPaths((prev) => {
      const pathStr = path.join(".");
      const next = new Set(prev);
      if (next.has(pathStr)) next.delete(pathStr);
      else next.add(pathStr);
      return next;
    });
  }, []);

  const handleRefreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await readAllValues();
    } finally {
      setIsRefreshing(false);
    }
  }, [readAllValues]);

  useEffect(() => {
    // Initialize store with empty values for all parameters
    const initialValues = initializeValues(mockSchema);
    Object.keys(initialValues).forEach((path) => {
      useParamsStore.setState((state) => ({
        values: {
          ...state.values,
          [path]: {
            current: null,
            edited: null,
            pending: null,
            isLoading: false,
          },
        },
      }));
    });

    // Read initial values
    handleRefreshAll();
  }, [handleRefreshAll]);

  return (
    <div className="flex flex-col gap-4">
      <Button
        className="self-end"
        variant="outline"
        size="icon"
        onClick={handleRefreshAll}
        disabled={isRefreshing}
      >
        <RotateCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
      </Button>
      <ScrollArea className="pr-4">
        <ParamTree
          schema={mockSchema}
          path={[]}
          expanded={expandedPaths}
          onToggle={handleToggle}
        />
      </ScrollArea>
    </div>
  );
}
