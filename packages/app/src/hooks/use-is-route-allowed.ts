import { useIsPermitted } from "@/hooks/use-is-permitted";

export function useIsRouteAllowed(route: string) {
  const isAllowed = useIsPermitted(`${route}-route`);

  return isAllowed;
}
