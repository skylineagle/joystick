import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import home from "@/icons/home.json";
import { cn } from "@/lib/utils";
import { Outlet, useNavigate } from "react-router-dom";
import { Icon } from "./icons/icon";
import { Controls } from "./pages/stream-view/controls";

export function Layout() {
  const { isMobileLandscape } = useMobileLandscape();
  const navigate = useNavigate();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <div
          className={cn(
            "h-[100dvh] flex flex-col p-4",
            isMobileLandscape && "overflow-hidden p-0 w-full"
          )}
        >
          <div className="flex items-center mb-4">
            <Button
              variant="link"
              size="icon"
              onClick={() => navigate("/")}
              className="mr-2"
            >
              <Icon icon={home} style={{ width: 32, height: 32 }} />
            </Button>
          </div>
          <div
            className={cn(
              "flex-1 flex flex-col overflow-hidden",
              isMobileLandscape && "h-[100dvh]"
            )}
          >
            <div className="flex-1 overflow-auto">
              <div
                className={cn(
                  "inset-0 h-full",
                  isMobileLandscape && "h-[100dvh]"
                )}
              >
                <div
                  className={cn(
                    "flex items-start justify-center h-full",
                    isMobileLandscape ? "p-1" : "p-2 sm:p-4"
                  )}
                >
                  <div
                    className={cn(
                      "flex gap-2",
                      isMobileLandscape
                        ? "flex-row"
                        : "flex-col md:flex-row gap-4 md:gap-6 size-full max-w-[1200px]"
                    )}
                  >
                    <div className="flex-1">
                      <Outlet />
                    </div>
                    <Controls />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Toaster position="top-center" closeButton />
      </TooltipProvider>
    </ThemeProvider>
  );
}
