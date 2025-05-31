import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Zap,
} from "lucide-react";

export const NotificationHelp = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Notification System
          </DialogTitle>
          <DialogDescription>
            Understanding how different notification types work
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <Zap className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-100">
                  Emergency
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Shows as a blocking popup dialog. Must be acknowledged to
                  dismiss.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/50">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-100">
                  Error
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Shows as a persistent toast. Stays until manually dismissed.
                  Remains unread until you dismiss it.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-200/50 dark:border-yellow-800/50">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                  Warning
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Shows as a persistent toast. Stays until manually dismissed.
                  Remains unread until you dismiss it.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100">
                  Success
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Shows as a toast for 3 seconds. Automatically marked as read
                  after viewing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Info
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Shows as a toast for 4 seconds. Automatically marked as read
                  after viewing.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              All notifications are saved in the notification panel for later
              review, sorted by priority and read status.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
