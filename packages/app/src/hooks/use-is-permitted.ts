import { useAuthStore } from "@/lib/auth";
import { getIsPermitted } from "@/lib/permissions";
import { useQuery } from "@tanstack/react-query";

export function useIsPermitted(action: string) {
  const { user } = useAuthStore();
  const { data: isPermitted } = useQuery({
    queryKey: ["is-permitted", user?.id, action],
    queryFn: async () => {
      if (!user) return false;

      const result = await getIsPermitted(action, user.id);
      return result;
    },
    enabled: !!user,
  });

  return isPermitted;
}
