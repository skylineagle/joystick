import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDevice } from "@/hooks/use-device";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { cn } from "@/lib/utils";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

const navItems = [
  {
    label: "Stream",
    path: "",
  },
  {
    label: "Parameters",
    path: "params",
  },
  {
    label: "Actions",
    path: "actions",
  },
  {
    label: "Terminal",
    path: "terminal",
  },
];

export function Layout() {
  const { isMobileLandscape } = useMobileLandscape();
  const { device: deviceId } = useParams();
  const { data: currentDevice } = useDevice(deviceId ?? "");
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Get the current page name from the pathname
  const getPageName = () => {
    if (!deviceId) return "";

    // Remove the device ID from the path
    const path = pathname.split("/").filter(Boolean)[1] || "";

    // Find matching nav item or default to Stream for root path
    const navItem = navItems.find((item) => item.path === path);
    return navItem?.label || "Stream";
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        onClick={() => navigate("/")}
                        className="cursor-pointer"
                      >
                        {currentDevice?.name || "Select Device"}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {deviceId && (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>{getPageName()}</BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <main className={cn("flex-1 p-4", isMobileLandscape && "p-2")}>
              <Outlet />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
