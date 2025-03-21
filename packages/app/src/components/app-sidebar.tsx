import { DeviceSwitcher } from "@/components/device-switcher";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
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
import { UserProfile } from "@/components/user-profile";
import { ArrowLeft, Home, Send, Settings, Terminal } from "lucide-react";
import { useQueryState } from "nuqs";
import * as React from "react";
import { Link, useLocation, useParams } from "react-router";

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
  const { device: deviceId } = useParams();
  const [activeTab] = useQueryState("activeTab");
  const location = useLocation();

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
                <Link
                  to={{
                    pathname: `/${deviceId}${item.path ? `/${item.path}` : ""}`,
                    search: `?activeTab=${activeTab}`,
                  }}
                  preventScrollReset={true}
                  replace={false}
                  key={item.path}
                >
                  <item.icon />
                  <Label>{item.label}</Label>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
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
