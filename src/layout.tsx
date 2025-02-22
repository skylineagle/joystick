import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
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

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
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
