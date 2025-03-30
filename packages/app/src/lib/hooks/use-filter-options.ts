import { useQuery } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { Collections } from "@/types/db.types";

interface FilterOptions {
  actions: Array<{ id: string; name: string }>;
  devices: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string }>;
}

export function useFilterOptions() {
  const { data: actions } = useQuery({
    queryKey: ["actions"],
    queryFn: async () => {
      const result = await pb.collection(Collections.Actions).getList(1, 100, {
        sort: "name",
      });
      return result.items.map((action) => ({
        id: action.id,
        name: action.name,
      }));
    },
  });

  const { data: devices } = useQuery({
    queryKey: ["devices"],
    queryFn: async () => {
      const result = await pb.collection(Collections.Devices).getList(1, 100, {
        sort: "name",
      });
      return result.items.map((device) => ({
        id: device.id,
        name: device.name,
      }));
    },
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await pb.collection(Collections.Users).getList(1, 100, {
        sort: "name",
      });
      return result.items.map((user) => ({
        id: user.id,
        name: user.name,
      }));
    },
  });

  return {
    actions: actions || [],
    devices: devices || [],
    users: users || [],
  };
}
