import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useDevice } from "@/hooks/use-device";
import { useDevices } from "@/hooks/use-devices";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

export function DeviceSwitcher() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { device: deviceId } = useParams();
  const currentPage = pathname.split(deviceId ?? "")[1].replaceAll("/", "");
  const { data: currentDevice, isLoading: isLoadingDevice } = useDevice(
    deviceId ?? ""
  );
  const { data: devices, isLoading: isLoadingDevices } = useDevices();
  const { isMobile } = useSidebar();
  const [open, setOpen] = useState(false);

  const deviceName = currentDevice?.name;
  const isLoading = isLoadingDevice || isLoadingDevices;

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Check if Command (Mac) or Control (Windows/Linux) is pressed
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;

      if (isCmdOrCtrl && event.key === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }

      if (isCmdOrCtrl && event.key === "n") {
        event.preventDefault();
      }

      // Handle number shortcuts (⌘1-9) for quick device selection
      if (isCmdOrCtrl && /^[1-9]$/.test(event.key) && devices) {
        event.preventDefault();
        const index = parseInt(event.key) - 1;
        const device = devices[index];
        if (device) {
          navigate(`/${device.id}/${currentPage}${search}`);
          setOpen(false);
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate, open, devices, currentPage, search]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              data-testid="device-switcher-button"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-muted font-medium">
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  deviceName?.[0]?.toUpperCase()
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {isLoading ? "Loading..." : deviceName || "Select Device"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {isLoading ? "Please wait" : "Switch devices"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px]"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={8}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {isLoading ? "Loading devices..." : "Devices"}
            </DropdownMenuLabel>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-4 animate-spin" />
              </div>
            ) : (
              devices?.map((device, index) => (
                <DropdownMenuItem
                  key={device.id}
                  data-testid={`device-switcher-${device.id}`}
                  onClick={() => {
                    navigate(`/${device.id}/${currentPage}${search}`);
                    setOpen(false);
                  }}
                  className={cn("gap-2", device.id === deviceId && "bg-accent")}
                >
                  <div className="flex size-6 items-center justify-center rounded-md bg-muted font-medium">
                    {device.name[0]?.toUpperCase()}
                  </div>
                  <span className="flex-1">{device.name}</span>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
