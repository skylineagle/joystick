import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { cn } from "@/lib/utils";
import { Controls } from "./pages/stream-view/controls";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: AppLayoutProps) {
  const { isMobileLandscape } = useMobileLandscape();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <div
          className={cn(
            "h-[100dvh] flex flex-col p-4",
            isMobileLandscape && "overflow-hidden p-0 w-full"
          )}
        >
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
                        : "flex-col md:flex-row gap-4 md:gap-6 w-full max-w-[1200px]"
                    )}
                  >
                    <div className="flex-1">{children}</div>
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
