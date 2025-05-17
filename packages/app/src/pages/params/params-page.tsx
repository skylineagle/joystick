import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsParamsSupported } from "@/hooks/use-support-params";
import { useParamsStore } from "@/lib/params.store";
import { ParamTree } from "@/pages/params/param-tree";
import { ParamNode, ParamPath } from "@/types/params";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { useIsRouteAllowed } from "@/hooks/use-is-route-allowed";
import { pb } from "@/lib/pocketbase";
import { useDevice } from "@/hooks/use-device";
import { ParametersTree } from "@joystick/core";

const fetchParameterTrees = async (
  modelId: string
): Promise<ParametersTree[]> => {
  const result = await pb
    .collection("parameters_tree")
    .getFullList<ParametersTree>({
      filter: `model = "${modelId}"`,
      expand: "read,write",
    });

  return result;
};

export function ParamsPage() {
  const { device: deviceId } = useParams();
  const isParamsSupported = useIsParamsSupported(deviceId!);
  const setDeviceId = useParamsStore((state) => state.setDeviceId);
  const isRouteAllowed = useIsRouteAllowed("parameters");
  const { data: device } = useDevice(deviceId!);
  const [parameterTrees, setParameterTrees] = useState<ParametersTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedPaths, setExpandedPaths] = useState<
    Record<string, Set<string>>
  >({});

  useEffect(() => {
    const loadParameterTrees = async () => {
      if (!deviceId) return;
      setDeviceId(deviceId);
      setLoading(true);
      setError("");
      if (!device?.device) return;

      try {
        const trees = await fetchParameterTrees(device.device);
        setParameterTrees(trees);

        const initialExpanded: Record<string, Set<string>> = {};
        trees.forEach((tree) => {
          initialExpanded[tree.id] = new Set([]);
          useParamsStore
            .getState()
            .setTreeActions(
              tree.id,
              tree.expand.read.name,
              tree.expand.write.name
            );
        });

        setExpandedPaths(initialExpanded);
        setLoading(false);
      } catch {
        setError("Failed to load parameter trees");
        setLoading(false);
      }
    };

    loadParameterTrees();
  }, [device?.device, deviceId, setDeviceId]);

  const handleToggle = useCallback((treeId: string, path: ParamPath) => {
    setExpandedPaths((prev) => {
      const pathStr = path.join(".");
      const next = { ...prev };
      const set = new Set(next[treeId] || []);
      if (set.has(pathStr)) set.delete(pathStr);
      else set.add(pathStr);
      next[treeId] = set;
      return next;
    });
  }, []);

  if (!isRouteAllowed) {
    return <div>You are not allowed to access this page</div>;
  }

  if (!isParamsSupported) {
    return <div className="p-4">Params are not supported</div>;
  }

  if (loading) {
    return <div className="p-4">Loading parameter trees...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!parameterTrees.length) {
    return <div className="p-4">No parameter trees found.</div>;
  }

  return (
    <div className="size-full">
      <ScrollArea className="h-[calc(100vh-120px)] px-2 sm:px-4">
        <div className="flex flex-col gap-6 pb-8">
          {parameterTrees.map((tree) => (
            <ParamTree
              key={tree.id}
              schema={tree.schema as ParamNode}
              path={[]}
              expanded={expandedPaths[tree.id] || new Set([])}
              onToggle={(path) => handleToggle(tree.id, path)}
              treeId={tree.id}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
