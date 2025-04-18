import { DeviceSwitcher } from "@/components/device-switcher";
import { RecentEvents } from "@/components/history-logger/recent-events";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useIsPermitted } from "@/hooks/use-is-permitted";
import { useIsParamsSupported } from "@/hooks/use-support-params";
import { useIsTerminalSupported } from "@/hooks/use-support-terminal";
import {
  ArrowLeft,
  Image,
  Send,
  Settings,
  Terminal,
  Video,
} from "lucide-react";
import * as React from "react";
import { Link, useLocation, useParams } from "react-router";

const navItems = [
  {
    label: "Stream",
    icon: Video,
    path: "stream",
    description: "Live video stream and controls",
  },
  {
    label: "Parameters",
    icon: Settings,
    path: "params",
    description: "Device parameters and configuration",
  },
  {
    label: "Actions",
    icon: Send,
    path: "actions",
    description: "Execute device actions",
  },
  {
    label: "Terminal",
    icon: Terminal,
    path: "terminal",
    description: "Device terminal access",
  },
  {
    label: "Gallery",
    icon: Image,
    path: "gallery",
    description: "View and manage device events",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { device: deviceId } = useParams();
  const location = useLocation();
  const isParamsSupported = useIsParamsSupported(deviceId!);
  const isTerminalSupported = useIsTerminalSupported(deviceId!);
  const isRecentEventPermitted = useIsPermitted("recent-events");

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <DeviceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="my-2 space-y-1 px-1">
          {navItems
            .filter((item) => {
              if (item.path === "params" && !isParamsSupported) {
                return false;
              }
              if (item.path === "terminal" && !isTerminalSupported) {
                return false;
              }
              return true;
            })
            .map((item) => {
              const isActive = location.pathname.endsWith(item.path);
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.description}
                    isActive={isActive}
                  >
                    <Link
                      to={`/${deviceId}/${item.path}`}
                      className="flex items-center gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {isRecentEventPermitted && <RecentEvents />}
        <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
          <Link
            to={{
              pathname: "/",
              search: location.search,
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
