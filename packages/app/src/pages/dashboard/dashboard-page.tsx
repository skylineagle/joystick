import { AppStatusIndicator } from "@/components/app-status-indicator";
import { ConfettiEasterEgg } from "@/components/confetti-easter-egg";
import { BatchOperations } from "@/components/device/batch-operations";
import { DeviceRow } from "@/components/device/device";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import { UserProfile } from "@/components/user-profile";
import { useDevicesQuery } from "@/hooks/use-devices-query";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useAuthStore } from "@/lib/auth";
import { DeviceTableHeader } from "@/pages/dashboard/devices-header";
import { Filters } from "@/pages/dashboard/filters";
import { useDeviceStore } from "@/store/device-store";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Gauge } from "lucide-react";
import { Link } from "react-router-dom";
import { Toaster } from "sonner";

export function DashboardPage() {
  const { user } = useAuthStore();
  const { devices } = useDevicesQuery();
  const { selectedDevices, selectDevice, selectAllDevices, clearSelection } =
    useDeviceStore();
  const isAdmin = useIsPermitted("admin-dashboard");

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
              <AppStatusIndicator />
            </div>

            <div className="flex items-center gap-5">
              {isAdmin && (
                <Button variant="link" size="sm" asChild>
                  <Link to="/admin">
                    <Gauge className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                </Button>
              )}
              <AnimatedThemeToggle />
              <UserProfile />
            </div>
          </div>

          <div className="flex-1 p-12">
            <Card className="shadow-2xl border-none">
              <CardHeader className="pb-4">
                <Filters />
                <BatchOperations
                  selectedDevices={selectedDevices}
                  onClearSelection={clearSelection}
                />
              </CardHeader>
              <CardContent>
                <div>
                  <Table>
                    <DeviceTableHeader
                      onSelectAll={() =>
                        selectAllDevices(
                          devices?.map((device) => device.id) ?? []
                        )
                      }
                      isAllSelected={
                        devices?.length === selectedDevices.length &&
                        selectedDevices.length > 0
                      }
                    />
                  </Table>
                </div>
                <div className="overflow-auto h-[calc(100vh-24rem)] scrollbar-thin scrollbar-thumb-secondary scrollbar-track-secondary/20">
                  <Table>
                    <TableBody className="relative">
                      {devices?.map((device) => (
                        <DeviceRow
                          key={device.id}
                          device={device}
                          isSelected={selectedDevices.includes(device.id)}
                          onSelect={selectDevice}
                        />
                      ))}
                    </TableBody>
                  </Table>
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
