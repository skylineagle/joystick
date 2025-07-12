import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InngestEvent } from "@/lib/inngest";
import { Clock, Filter, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { TaskCard } from "./task-card";

interface EnhancedTaskListProps {
  tasks: InngestEvent[];
}

export function EnhancedTaskList({ tasks }: EnhancedTaskListProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Task Queue</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Monitor your offline tasks
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mx-auto mb-6">
                <Play className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No tasks yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Create your first offline task to get started. Tasks will appear
                here when queued.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Tasks will appear here when created
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <CardTitle className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Task Queue</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    {tasks.length} {tasks.length === 1 ? "task" : "tasks"} in
                    queue
                  </p>
                </div>
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[500px] lg:h-[600px] w-full pr-4 rounded-lg">
            <AnimatePresence mode="popLayout">
              {tasks.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mx-auto mb-6">
                    <Filter className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    No tasks match your filter
                  </h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Try adjusting your filter or sort options to see more tasks
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      exit={{ opacity: 0, scale: 0.95, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TaskCard task={task} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
