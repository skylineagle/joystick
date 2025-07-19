import { createUrl, joystickApi } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth";
import { urls } from "@/lib/urls";
import { useQuery } from "@tanstack/react-query";

export type TerminalSession = {
  id: string;
  session_id: string;
  user: string;
  device: string;
  session_status: "active" | "disconnected" | "terminated";
  last_activity: string;
  created_at: string;
  terminal_data?: Record<string, unknown>;
};

export function useTerminalSessions(deviceId: string) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["terminal-sessions", deviceId],
    queryFn: async (): Promise<TerminalSession[]> => {
      if (!deviceId || !token) {
        return [];
      }

      try {
        const response = await joystickApi.get<{
          data: { sessions: TerminalSession[] };
        }>(createUrl(urls.panel, `/api/terminal/sessions/${deviceId}`));

        return response.data?.sessions || [];
      } catch (error) {
        console.error("Failed to fetch terminal sessions:", error);
        return [];
      }
    },
    enabled: !!deviceId && !!token,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useActiveTerminalSessions(deviceId: string) {
  const { data: sessions = [] } = useTerminalSessions(deviceId);

  return sessions.filter(
    (session) =>
      session.session_status === "active" ||
      session.session_status === "disconnected"
  );
}
