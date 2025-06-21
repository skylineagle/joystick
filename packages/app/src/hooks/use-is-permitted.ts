import { useAuthStore } from "@/lib/auth";
import { getIsPermitted } from "@/lib/permissions";
import { useQuery } from "@tanstack/react-query";

export function useIsPermitted<T extends readonly string[]>(
  actionOrActions: T
): Record<T[number], boolean> | undefined;
export function useIsPermitted(actionOrActions: string): boolean | undefined;
export function useIsPermitted<T extends string | readonly string[]>(
  actionOrActions: T
): T extends readonly string[]
  ? Record<T[number], boolean> | undefined
  : boolean | undefined {
  const { user } = useAuthStore();

  const { data: isPermitted } = useQuery({
    queryKey: ["is-permitted", user?.id, actionOrActions],
    queryFn: async () => {
      if (!user) {
        return Array.isArray(actionOrActions) ? {} : false;
      }

      if (Array.isArray(actionOrActions)) {
        return await getIsPermitted(
          actionOrActions as readonly string[],
          user.id
        );
      } else {
        return await getIsPermitted(actionOrActions as string, user.id);
      }
    },
    enabled: !!user,
  });

  return isPermitted as T extends readonly string[]
    ? Record<T[number], boolean> | undefined
    : boolean | undefined;
}
