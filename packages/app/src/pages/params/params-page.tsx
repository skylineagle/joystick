import { ScrollArea } from "@/components/ui/scroll-area";
import { useDevice } from "@/hooks/use-device";
import { useIsParamsSupported } from "@/hooks/use-support-params";
import { useParamsStore } from "@/lib/params.store";
import { ParamTree } from "@/pages/params/param-tree";
import { ParamPath } from "@/types/params";
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

export function ParamsPage() {
  const { device: deviceId } = useParams();
  const { data: device } = useDevice(deviceId!);
  const isParamsSupported = useIsParamsSupported(deviceId!);
  const setDeviceId = useParamsStore((state) => state.setDeviceId);

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set([]));

  if (deviceId) {
    setDeviceId(deviceId);
  }

  const handleToggle = useCallback((path: ParamPath) => {
    setExpandedPaths((prev) => {
      const pathStr = path.join(".");
      const next = new Set(prev);
      if (next.has(pathStr)) next.delete(pathStr);
      else next.add(pathStr);
      return next;
    });
  }, []);

  if (!isParamsSupported) {
    return <div className="p-4">Params are not supported</div>;
  }

  if (!device?.expand?.device.params) {
    return <div className="p-4">Loading device parameters...</div>;
  }

  const schema = device.expand?.device.params;

  return (
    <div className="size-full">
      <ScrollArea className="h-[calc(100vh-120px)] px-2 sm:px-4">
        <div className="pb-8">
          <ParamTree
            schema={schema}
            path={[]}
            expanded={expandedPaths}
            onToggle={handleToggle}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
