import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActions } from "@/hooks/use-actions";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { ActionForm } from "./action-form";

export function ActionsPage() {
  const { device: deviceId } = useParams();
  const {
    actions,
    isLoading,
    runAction,
    isRunning,
    actionResult,
    currentAction,
  } = useActions(deviceId!);
  const [expandedResult, setExpandedResult] = useState(false);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
    );
  }

  if (!actions?.length) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>No Actions Available</CardTitle>
            <CardDescription>
              This device does not have any available actions.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const filteredActions = actions.filter(
    (action) => typeof action === "string"
  );

  return (
    <div className="size-full p-4">
      <Tabs
        defaultValue={filteredActions[0]}
        orientation="vertical"
        className="flex w-full gap-4"
      >
        <TabsList className="flex-col w-64 space-y-1 bg-transparent rounded-md">
          <Label className="font-bold text-md self-start">Actions</Label>
          <ScrollArea className="h-[calc(100dvh-100px)]">
            {filteredActions.map((action) => (
              <TabsTrigger
                key={action}
                value={action}
                className="w-full justify-start data-[state=active]:bg-muted data-[state=active]:shadow-none"
              >
                <span className="capitalize">{action.replace(/-/g, " ")}</span>
              </TabsTrigger>
            ))}
          </ScrollArea>
        </TabsList>
        <div className="grow">
          {filteredActions.map((action) => (
            <TabsContent
              key={action}
              value={action}
              className="mt-0 border-0 space-y-4"
            >
              <ActionForm
                deviceId={deviceId}
                action={action}
                onSubmit={(params) => runAction({ action, params })}
                isSubmitting={isRunning && currentAction === action}
              />

              {currentAction === action && actionResult && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>Action Result</span>
                      <Badge variant="outline" className="gap-1.5">
                        <span
                          className="size-1.5 rounded-full bg-emerald-500"
                          aria-hidden="true"
                        />
                        Sucess
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Output from the {action.replace(/-/g, " ")} action
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 rounded-md border">
                      <ScrollArea
                        className={cn(
                          "w-full font-mono text-sm",
                          expandedResult ? "max-h-96" : "max-h-32"
                        )}
                      >
                        <pre>{actionResult}</pre>
                      </ScrollArea>
                    </div>
                  </CardContent>
                  {actionResult && actionResult.length > 100 && (
                    <CardFooter>
                      <button
                        onClick={() => setExpandedResult(!expandedResult)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {expandedResult ? "Show less" : "Show more"}
                      </button>
                    </CardFooter>
                  )}
                </Card>
              )}

              {currentAction === action && isRunning && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>Action Result</span>
                      <Badge variant="outline" className="bg-blue-50">
                        <LoaderCircle className="h-4 w-4 mr-1 animate-spin text-blue-500" />
                        Running
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Executing the {action.replace(/-/g, " ")} action...
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center p-8">
                      <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
