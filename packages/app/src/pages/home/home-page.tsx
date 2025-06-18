import { AppStatusIndicator } from "@/components/app-status-indicator";
import { BatchOperations } from "@/components/device/batch-operations";
import { ConfettiEasterEgg } from "@/components/easter-eggs/confetti-easter-egg";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NotificationPanel } from "@/components/ui/notifications/notification-panel";
import { UserProfile } from "@/components/user-profile";
import { useDevicesQuery } from "@/hooks/use-devices-query";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useAuthStore } from "@/lib/auth";
import { useDeviceStore } from "@/store/device-store";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Gauge, PanelsTopLeft } from "lucide-react";
import { Suspense, lazy } from "react";
import { Link } from "react-router";

const DeviceDataTable = lazy(() =>
  import("@/components/device/device-data-table").then((module) => ({
    default: module.DeviceDataTable,
  }))
);

export function HomePage() {
  const { user } = useAuthStore();
  const { devices } = useDevicesQuery();
  const { selectedDevices, clearSelection } = useDeviceStore();
  const isSystemStatusRouteAllowed = useIsPermitted("system-status");
  const isAdmin = useIsPermitted("admin-dashboard") ?? false;

  return (
    <TooltipProvider>
      <div className="h-screen">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-12 py-4">
            <div className="flex items-center gap-2">
              <ConfettiEasterEgg>
                <img
                  src="/logo.png"
                  alt="Joystick Logo"
                  className="h-16 w-16 cursor-pointer"
                  width="64"
                  height="64"
                  loading="lazy"
                />
              </ConfettiEasterEgg>
              <h1 className="text-3xl font-bold">
                {user?.email.includes("user") ? "HaTomer" : "Joystick"}
              </h1>
              {isSystemStatusRouteAllowed && <AppStatusIndicator />}
            </div>

            <div className="flex items-center gap-5">
              {isAdmin && (
                <Button variant="link" size="sm" asChild>
                  <Link to="/admin">
                    <Gauge className="h-4 w-4" />
                    Admin Panel
                  </Link>
                </Button>
              )}
              <Button variant="link" size="sm" asChild>
                <Link to="/dashboard">
                  <PanelsTopLeft className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <NotificationPanel />
              <AnimatedThemeToggle />
              <UserProfile />
            </div>
          </div>

          <div className="flex-1 p-12">
            <div className="flex gap-6 h-full">
              <Card className="shadow-2xl border-none flex-1">
                <CardHeader className="pb-4">
                  <BatchOperations
                    selectedDevices={selectedDevices}
                    onClearSelection={clearSelection}
                  />
                </CardHeader>
                <CardContent>
                  <div className="h-[calc(100vh-16rem)]">
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center h-full">
                          Loading device data...
                        </div>
                      }
                    >
                      <DeviceDataTable data={devices || []} />
                    </Suspense>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
