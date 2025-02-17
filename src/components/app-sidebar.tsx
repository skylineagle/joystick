import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useDevice } from "@/hooks/use-device";
import { Command, Home, Send, Settings, Terminal, User } from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

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
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const { device: deviceId } = useParams();
  const { data: currentDevice } = useDevice(deviceId ?? "");

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" onClick={() => navigate("/")}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="flex-1 text-left text-sm flex items-center gap-2">
                  <Label className="truncate font-semibold text-lg">
                    {currentDevice?.name || "Select Device"}
                  </Label>

                  {currentDevice?.expand?.device.name && (
                    <Badge variant="outline" className="mt-1">
                      {currentDevice.expand.device.name}
                    </Badge>
                  )}
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="size-4" />
              <span className="text-sm font-medium">Profile</span>
            </Button>
            <AnimatedThemeToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
