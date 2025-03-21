import { AppSidebar } from "@/components/app-sidebar";
import { AppStatusIndicator } from "@/components/app-status-indicator";
import { DeviceHealthIndicator } from "@/components/device/device-health-indicator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";
import { Controls } from "@/pages/stream-view/controls";
import { RoiProvider } from "@/pages/stream-view/roi/roi-provider";
import { DeviceResponse } from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Outlet, useParams } from "react-router";

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const queryClient = useQueryClient();
  const { isMobileLandscape } = useMobileLandscape();
  const { device: deviceId } = useParams();

  useEffect(() => {
    pb.collection("devices").subscribe<DeviceResponse>(deviceId!, (e) => {
      if (e.action === "update") {
        queryClient.invalidateQueries({ queryKey: ["device", e.record.id] });
      }
    });

    return () => {
      pb.collection("devices").unsubscribe(deviceId!);
    };
  }, [deviceId, queryClient]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <RoiProvider deviceId={deviceId!}>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <AppStatusIndicator />
              </div>
              {deviceId && (
                <div className="flex items-center gap-2 px-4">
                  <DeviceHealthIndicator />
                </div>
              )}
            </header>
            <main className={cn("flex-1 p-2", isMobileLandscape && "p-2")}>
              <div
                className={cn(
                  "flex gap-4 md:gap-6 h-full border-none",
                  isMobileLandscape ? "flex-row" : "flex-col md:flex-row"
                )}
              >
                <div className="flex-1 min-h-0 relative border-none">
                  {children || <Outlet />}
                </div>
                <Controls />
              </div>
            </main>
          </SidebarInset>
        </RoiProvider>
      </SidebarProvider>
    </TooltipProvider>
  );
}
