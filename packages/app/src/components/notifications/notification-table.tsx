import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { NotificationHistoryItem } from "@/lib/notification-db";
import { format } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Info,
  Zap,
} from "lucide-react";

interface NotificationTableProps {
  notifications: NotificationHistoryItem[];
  onMarkAsRead: (id: string) => void;
}

const getNotificationIcon = (type: NotificationHistoryItem["type"]) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case "emergency":
      return <Zap className="h-4 w-4 text-red-700" />;
    default:
      return <Info className="h-4 w-4 text-blue-600" />;
  }
};

const getTypeBadgeVariant = (type: NotificationHistoryItem["type"]) => {
  switch (type) {
    case "success":
      return "default";
    case "warning":
      return "secondary";
    case "error":
      return "destructive";
    case "emergency":
      return "destructive";
    default:
      return "outline";
  }
};

export const NotificationTable = ({
  notifications,
  onMarkAsRead,
}: NotificationTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"></TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Device</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-16">Status</TableHead>
          <TableHead className="w-16">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notifications.map((notification) => (
          <TableRow
            key={notification.id}
            className={cn(
              "transition-colors",
              !notification.read && "bg-muted/30"
            )}
          >
            <TableCell>{getNotificationIcon(notification.type)}</TableCell>
            <TableCell>
              <Badge variant={getTypeBadgeVariant(notification.type)}>
                {notification.type}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">{notification.title}</TableCell>
            <TableCell className="max-w-md overflow-auto">
              {notification.message}
            </TableCell>
            <TableCell>{notification.expand?.device?.name || "-"}</TableCell>
            <TableCell>
              {format(new Date(notification.created), "MMM dd, yyyy HH:mm")}
            </TableCell>
            <TableCell>
              {notification.read ? (
                <Eye className="h-4 w-4 text-muted-foreground" />
              ) : (
                <EyeOff className="h-4 w-4 text-primary" />
              )}
            </TableCell>
            <TableCell>
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
