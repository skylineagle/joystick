import { BatchOperations } from "@/components/device/batch-operations";
import { DeviceRow } from "@/components/device/device";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import { UserProfile } from "@/components/user-profile";
import { useDevicesQuery } from "@/hooks/use-devices-query";
import { DeviceTableHeader } from "@/pages/dashboard/devices-header";
import { Filters } from "@/pages/dashboard/filters";
import { useDeviceStore } from "@/store/device-store";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";

export function DashboardPage() {
  const { devices, isLoading } = useDevicesQuery();
  const { selectedDevices, selectDevice, selectAllDevices, clearSelection } =
    useDeviceStore();

  if (isLoading) return <div>Loading...</div>;

  return (
    <TooltipProvider>
      <div className="h-screen">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-12 py-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Switcher Logo" className="h-16 w-16" />
              <h1 className="text-3xl font-bold">HaTomer</h1>
            </div>

            <div className="flex items-center gap-5">
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
                <div className="bg-background">
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
                          deviceId={device.id}
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
