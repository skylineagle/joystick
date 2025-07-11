import { EnhancedTaskForm } from "@/components/tasks/enhanced-task-form";
import { EnhancedTaskList } from "@/components/tasks/enhanced-task-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsRouteAllowed } from "@/hooks/use-is-route-allowed";
import { useTasks } from "@/hooks/use-tasks";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

export function TasksPage() {
  const { tasks } = useTasks();
  const isRouteAllowed = useIsRouteAllowed("action");

  if (!isRouteAllowed) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">
                You are not allowed to access this page. Contact your
                administrator for access to task management.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-7xl mx-auto p-4 space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={pageVariants} className="space-y-6">
            <EnhancedTaskForm />
          </motion.div>

          <motion.div variants={pageVariants} className="space-y-6">
            <EnhancedTaskList tasks={tasks ?? []} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
