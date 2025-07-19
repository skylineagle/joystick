import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveTerminalSessions } from "@/hooks/use-terminal-sessions";
import { cn } from "@/lib/utils";
import { Clock, Terminal, User } from "lucide-react";

type TerminalSessionsProps = {
  deviceId: string;
  currentSessionId?: string | null;
  onReconnect?: (sessionId: string) => void;
};

export function TerminalSessions({
  deviceId,
  currentSessionId,
  onReconnect,
}: TerminalSessionsProps) {
  const sessions = useActiveTerminalSessions(deviceId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "disconnected":
        return "bg-yellow-500";
      case "terminated":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Terminal Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No active terminal sessions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Terminal Sessions ({sessions.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "flex items-center justify-between p-3 border rounded-lg",
                currentSessionId === session.session_id &&
                  "border-primary bg-primary/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    getStatusColor(session.session_status)
                  )}
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Session {session.session_id.slice(-8)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {session.session_status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(session.last_activity)}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {session.user}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session.session_status === "disconnected" && onReconnect && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReconnect(session.session_id)}
                  >
                    Reconnect
                  </Button>
                )}
                {currentSessionId === session.session_id && (
                  <Badge variant="secondary">Current</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
