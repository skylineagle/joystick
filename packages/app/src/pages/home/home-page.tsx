import { AppStatusIndicator } from "@/components/app-status-indicator";
import { ConfettiEasterEgg } from "@/components/confetti-easter-egg";
import { BatchOperations } from "@/components/device/batch-operations";
import { DeviceDataTable } from "@/components/device/device-data-table";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserProfile } from "@/components/user-profile";
import { useDevicesQuery } from "@/hooks/use-devices-query";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useAuthStore } from "@/lib/auth";
import { useDeviceStore } from "@/store/device-store";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Gauge, PanelsTopLeft } from "lucide-react";
import { Link } from "react-router";
import { Toaster } from "sonner";

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
              <AnimatedThemeToggle />
              <UserProfile />
            </div>
          </div>

          <div className="flex-1 p-12">
            <Card className="shadow-2xl border-none">
              <CardHeader className="pb-4">
                <BatchOperations
                  selectedDevices={selectedDevices}
                  onClearSelection={clearSelection}
                />
              </CardHeader>
              <CardContent>
                <div className="h-[calc(100vh-20rem)]">
                  <DeviceDataTable data={devices || []} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster position="top-center" closeButton />
    </TooltipProvider>
  );
}
