import { AppSidebar } from "@/components/app-sidebar";
import { DeviceHealthIndicator } from "@/components/device/device-health-indicator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { cn } from "@/lib/utils";
import { Outlet, useParams } from "react-router-dom";

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isMobileLandscape } = useMobileLandscape();
  const { device: deviceId } = useParams();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
            {deviceId && (
              <div className="flex items-center gap-2 px-4">
                <DeviceHealthIndicator />
              </div>
            )}
          </header>
          <main className={cn("flex-1 p-2", isMobileLandscape && "p-2")}>
            {children || <Outlet />}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
