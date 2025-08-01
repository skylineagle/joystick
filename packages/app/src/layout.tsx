import { getAvailableNavItems } from "@/components/app-sidebar";
import { DeviceSwitcher } from "@/components/device-switcher";
import { DeviceHealthIndicator } from "@/components/device/device-health-indicator";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { NotificationPanel } from "@/components/ui/notifications/notification-panel";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useIsRouteAllowed } from "@/hooks/use-is-route-allowed";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { useIsCellSearchSupported } from "@/hooks/use-support-cell-search";
import { useIsAudioSupported } from "@/hooks/use-support-audio";
import { useIsMediaSupported } from "@/hooks/use-support-media";
import { useIsParamsSupported } from "@/hooks/use-support-params";
import { useIsTerminalSupported } from "@/hooks/use-support-terminal";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";
import { CellSearchControls } from "@/pages/cell-search/cell-search-controls";
import { Controls } from "@/pages/stream-view/controls";
import { RoiProvider } from "@/pages/stream-view/roi/roi-provider";
import { DeviceResponse } from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { Suspense, lazy, useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router";

// Lazy load components
const AppSidebar = lazy(() =>
  import("@/components/app-sidebar").then((module) => ({
    default: module.AppSidebar,
  }))
);
const UserProfile = lazy(() =>
  import("@/components/user-profile").then((module) => ({
    default: module.UserProfile,
  }))
);
const AppStatusIndicator = lazy(() =>
  import("@/components/app-status-indicator").then((module) => ({
    default: module.AppStatusIndicator,
  }))
);

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const queryClient = useQueryClient();
  const { isMobileLandscape } = useMobileLandscape();
  const { device: deviceId } = useParams();
  const location = useLocation();

  const isOnCellSearchRoute = location.pathname.endsWith("/cell-search");
  const isOnGalleryRoute = location.pathname.endsWith("/gallery");
  useEffect(() => {
    let unsubscribe: () => void;
    if (!deviceId) return;
    const init = async () => {
      unsubscribe = await pb
        .collection("devices")
        .subscribe<DeviceResponse>(deviceId!, (e) => {
          if (e.action === "update") {
            queryClient.invalidateQueries({
              queryKey: ["device", e.record.id],
            });
          }
        });
    };
    init();
    return () => {
      try {
        unsubscribe?.();
      } catch (error) {
        console.error("Error unsubscribing from device:", error);
      }
    };
  }, [deviceId, queryClient]);

  const isParamsSupported = useIsParamsSupported(deviceId!);
  const isTerminalSupported = useIsTerminalSupported(deviceId!);
  const isMediaSupported = useIsMediaSupported(deviceId!);
  const isAudioSupported = useIsAudioSupported(deviceId!);
  const isCellSearchSupported = useIsCellSearchSupported(deviceId!);
  const isMediaRouteAllowed = useIsRouteAllowed("media");
  const isAudioRouteAllowed = useIsRouteAllowed("audio");
  const isActionRouteAllowed = useIsRouteAllowed("action");
  const isParamsRouteAllowed = useIsRouteAllowed("parameters");
  const isGalleryRouteAllowed = useIsRouteAllowed("gallery");
  const isTerminalRouteAllowed = useIsRouteAllowed("terminal");
  const isCellSearchRouteAllowed = useIsRouteAllowed("cell-search");
  const isSystemStatusRouteAllowed = useIsPermitted("system-status");
  const isMessageRouteAllowed = useIsRouteAllowed("message");

  const availableNavItems = getAvailableNavItems(
    !!isParamsSupported,
    !!isTerminalSupported,
    !!isMediaSupported,
    !!isAudioSupported,
    !!isCellSearchSupported,
    !!isMediaRouteAllowed,
    !!isAudioRouteAllowed,
    !!isActionRouteAllowed,
    !!isParamsRouteAllowed,
    !!isGalleryRouteAllowed,
    !!isTerminalRouteAllowed,
    !!isCellSearchRouteAllowed,
    !!isMessageRouteAllowed
  );
  const showSidebar = availableNavItems.length > 1;

  return (
    <TooltipProvider>
      <SidebarProvider>
        <RoiProvider deviceId={deviceId!}>
          {showSidebar && (
            <Suspense fallback={null}>
              <AppSidebar />
            </Suspense>
          )}
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 pt-3">
              <div className="flex items-center gap-5 px-4">
                <>
                  {showSidebar ? (
                    <SidebarTrigger className="-ml-1" />
                  ) : (
                    <DeviceSwitcher />
                  )}
                  <DeviceHealthIndicator />
                </>
              </div>
              <div className="flex items-center gap-5 p-4">
                {isSystemStatusRouteAllowed && (
                  <Suspense fallback={null}>
                    <AppStatusIndicator />
                  </Suspense>
                )}
                <NotificationPanel />
                <AnimatedThemeToggle />
                <Suspense fallback={null}>
                  <UserProfile />
                </Suspense>
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
                {deviceId &&
                  (isOnCellSearchRoute ? (
                    <CellSearchControls />
                  ) : (
                    !isOnGalleryRoute && <Controls />
                  ))}
              </div>
            </main>
          </SidebarInset>
        </RoiProvider>
      </SidebarProvider>
    </TooltipProvider>
  );
}
