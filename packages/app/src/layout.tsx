import { AppSidebar } from "@/components/app-sidebar";
import { AppStatusIndicator } from "@/components/app-status-indicator";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProfile } from "@/components/user-profile";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";
import { Controls } from "@/pages/stream-view/controls";
import { RoiProvider } from "@/pages/stream-view/roi/roi-provider";
import { DeviceResponse } from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Outlet, useParams } from "react-router";
import { DeviceHealthIndicator } from "@/components/device/device-health-indicator";

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const queryClient = useQueryClient();
  const { isMobileLandscape } = useMobileLandscape();
  const { device: deviceId } = useParams();

  useEffect(() => {
    if (!deviceId) return;
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
              <div className="flex items-center gap-5 px-4">
                <SidebarTrigger className="-ml-1" />
                <DeviceHealthIndicator />
              </div>

              <div className="flex items-center gap-5 p-4">
                <AppStatusIndicator />
                <AnimatedThemeToggle />
                <UserProfile />
              </div>
            </header>
            <main className="flex-1 p-2 overflow-hidden max-h-[calc(100vh-4rem)]">
              <div
                className={cn(
                  "flex gap-4 md:gap-6 h-full border-none",
                  isMobileLandscape ? "flex-row" : "flex-col md:flex-row"
                )}
              >
                <div className="flex-1 min-h-0 relative border-none overflow-auto">
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
