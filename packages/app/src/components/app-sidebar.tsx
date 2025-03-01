import { DeviceSwitcher } from "@/components/device-switcher";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Label } from "@/components/ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserProfile } from "@/components/user-profile";
import { Home, SatelliteDish, Send, Settings, Terminal } from "lucide-react";
import * as React from "react";
import { useParams } from "react-router-dom";

const navItems = [
  {
    label: "Home",
    icon: Home,
    path: "",
    description: "Device overview and status",
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
    label: "Status",
    icon: SatelliteDish,
    path: "status",
    description: "Device status and information",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { device: deviceId } = useParams();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <DeviceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="my-2 space-y-1 px-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                size="sm"
                isActive={
                  location.pathname ===
                  `/${deviceId}${item.path ? `/${item.path}` : ""}`
                }
              >
                <a href={`/${deviceId}${item.path ? `/${item.path}` : ""}`}>
                  <item.icon />
                  <Label>{item.label}</Label>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <UserProfile />
            <AnimatedThemeToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
