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
import { useIsRouteAllowed } from "@/hooks/use-is-route-allowed";
import { cn } from "@/lib/utils";
import { ActionResultDisplay } from "@/pages/actions/action-result";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";
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
  const isRouteAllowed = useIsRouteAllowed("action");

  if (!isRouteAllowed) {
    return <div>You are not allowed to access this page</div>;
  }

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
    (action) => typeof action === "string",
  );

  return (
    <Tabs
      defaultValue={filteredActions[0]}
      orientation="vertical"
      className="size-full p-2 flex gap-4"
    >
      <TabsList className="flex-col w-64 bg-transparent rounded-md">
        <Label className="font-bold text-md self-start mb-4">Actions</Label>
        <ScrollArea className="h-[calc(100vh-180px)]">
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
            className="flex align-start flex-col gap-4"
          >
            <ActionForm
              deviceId={deviceId}
              action={action}
              onSubmit={(params) => runAction({ action, params })}
              isSubmitting={isRunning && currentAction === action}
            />

            {currentAction === action && actionResult && (
              <Card className="overflow-hidden border shadow-lg">
                <CardHeader className="pb-2 space-y-1">
                  <CardTitle className="flex justify-between items-center gap-3 text-lg">
                    <span>Action Result</span>
                    <Badge variant="outline" className="gap-1.5 shrink-0">
                      <span
                        className="size-1.5 rounded-full bg-emerald-500"
                        aria-hidden="true"
                      />
                      Success
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Output from the {action.replace(/-/g, " ")} action
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="rounded-lg border bg-muted/30">
                    <ScrollArea
                      className={cn(
                        "w-full overflow-y-auto px-3 py-2.5 font-mono text-sm",
                        !expandedResult && "max-h-56",
                      )}
                    >
                      <ActionResultDisplay content={actionResult} />
                    </ScrollArea>
                  </div>
                </CardContent>
                {actionResult && actionResult.length > 120 && (
                  <CardFooter className="pt-0">
                    <button
                      type="button"
                      onClick={() => setExpandedResult(!expandedResult)}
                      aria-expanded={expandedResult}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
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
  );
}
