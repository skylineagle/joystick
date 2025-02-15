import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActions } from "@/hooks/use-actions";
import { useParams } from "react-router-dom";
import { ActionForm } from "./action-form";

export function ActionsPage() {
  const { device: deviceId } = useParams();
  const { actions, isLoading, runAction, isRunning } = useActions(deviceId!);

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
            <TabsContent key={action} value={action} className="mt-0 border-0">
              <ActionForm
                action={action}
                onSubmit={(params) => runAction({ action, params })}
                isSubmitting={isRunning}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
