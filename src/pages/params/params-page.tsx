import { ScrollArea } from "@/components/ui/scroll-area";
import { ParamTree } from "@/pages/params/param-tree";
import { ParamNode, ParamPath } from "@/types/params";
import { useCallback, useState } from "react";

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

export function ParamsPage() {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set([]));

  const handleToggle = useCallback((path: ParamPath) => {
    setExpandedPaths((prev) => {
      const pathStr = path.join(".");
      const next = new Set(prev);
      if (next.has(pathStr)) next.delete(pathStr);
      else next.add(pathStr);
      return next;
    });
  }, []);

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[calc(100vh-120px)] px-2 sm:px-4">
        <div className="pb-8">
          <ParamTree
            schema={mockSchema}
            path={[]}
            expanded={expandedPaths}
            onToggle={handleToggle}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
