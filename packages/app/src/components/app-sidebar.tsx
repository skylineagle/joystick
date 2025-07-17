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
import { useIsRouteAllowed } from "@/hooks/use-is-route-allowed";
import { useIsCellSearchSupported } from "@/hooks/use-support-cell-search";
import { useIsAudioSupported } from "@/hooks/use-support-audio";
import { useIsMediaSupported } from "@/hooks/use-support-media";
import { useIsParamsSupported } from "@/hooks/use-support-params";
import { useIsTerminalSupported } from "@/hooks/use-support-terminal";
import {
  ArrowLeft,
  Image,
  MessageCircle,
  Music,
  Radio,
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
    label: "Audio",
    icon: Music,
    path: "audio",
    description: "Live audio stream and visualization",
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
  {
    label: "Messages",
    icon: MessageCircle,
    path: "messages",
    description: "Send and receive messages",
  },
  {
    label: "What the cell",
    icon: Radio,
    path: "cell-search",
    description: "Cellular network analysis and cell tower search",
  },
];

// eslint-disable-next-line react-refresh/only-export-components
export const getAvailableNavItems = (
  isParamsSupported: boolean,
  isTerminalSupported: boolean,
  isMediaSupported: boolean,
  isAudioSupported: boolean,
  isCellSearchSupported: boolean,
  isMediaRouteAllowed: boolean,
  isAudioRouteAllowed: boolean,
  isActionRouteAllowed: boolean,
  isParamsRouteAllowed: boolean,
  isGalleryRouteAllowed: boolean,
  isTerminalRouteAllowed: boolean,
  isCellSearchRouteAllowed: boolean,
  isMessageRouteAllowed: boolean
) => {
  return navItems.filter((item) => {
    if (
      item.path === "params" &&
      (!isParamsSupported || !isParamsRouteAllowed)
    ) {
      return false;
    }
    if (
      item.path === "terminal" &&
      (!isTerminalSupported || !isTerminalRouteAllowed)
    ) {
      return false;
    }
    if (
      item.path === "stream" &&
      (!isMediaSupported || !isMediaRouteAllowed || isAudioRouteAllowed)
    ) {
      return false;
    }
    if (item.path === "audio" && (!isAudioSupported || !isAudioRouteAllowed)) {
      return false;
    }
    if (item.path === "actions" && !isActionRouteAllowed) {
      return false;
    }
    if (item.path === "parameters" && !isParamsRouteAllowed) {
      return false;
    }
    if (item.path === "gallery" && !isGalleryRouteAllowed) {
      return false;
    }
    if (
      item.path === "cell-search" &&
      (!isCellSearchSupported || !isCellSearchRouteAllowed)
    ) {
      return false;
    }
    if (item.path === "messages" && !isMessageRouteAllowed) {
      return false;
    }
    return true;
  });
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { device: deviceId } = useParams();
  const location = useLocation();
  const isParamsSupported = useIsParamsSupported(deviceId!);
  const isTerminalSupported = useIsTerminalSupported(deviceId!);
  const isMediaSupported = useIsMediaSupported(deviceId!);
  const isAudioSupported = useIsAudioSupported(deviceId!);
  const isCellSearchSupported = useIsCellSearchSupported(deviceId!);
  const isRecentEventPermitted = useIsPermitted("recent-events");
  const isMediaRouteAllowed = useIsRouteAllowed("media");
  const isAudioRouteAllowed = useIsRouteAllowed("audio");
  const isActionRouteAllowed = useIsRouteAllowed("action");
  const isParamsRouteAllowed = useIsRouteAllowed("parameters");
  const isGalleryRouteAllowed = useIsRouteAllowed("gallery");
  const isTerminalRouteAllowed = useIsRouteAllowed("terminal");
  const isCellSearchRouteAllowed = useIsRouteAllowed("cell-search");
  const isMessageRouteAllowed = useIsRouteAllowed("message");

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <DeviceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="my-2 space-y-1 px-1">
          {getAvailableNavItems(
            !!isParamsSupported,
            !!isTerminalSupported,
            !!isMediaSupported,
            !!isAudioSupported,
            !!isCellSearchSupported,
            !!isMediaRouteAllowed,
            !!isAudioRouteAllowed,
            !!isActionRouteAllowed,
            !!isParamsRouteAllowed,
            !!isGalleryRouteAllowed,
            !!isTerminalRouteAllowed,
            !!isCellSearchRouteAllowed,
            !!isMessageRouteAllowed
          ).map((item) => {
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
                    className="flex items-center gap-2 relative"
                  >
                    <div className="relative">
                      <item.icon className="h-4 w-4" />
                    </div>
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
