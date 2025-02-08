import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMobileLandscape } from "@/hooks/use-mobile-landscape";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Label } from "./components/ui/label";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobileLandscape } = useMobileLandscape();
  const isParamsPage = location.pathname === "/params";

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
            {!isMobileLandscape && (
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-3xl font-bold">Joystick</h1>
                {isParamsPage && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="gap-1 sm:gap-2 text-sm sm:text-base hover:bg-transparent active:bg-transparent"
                        onClick={() => navigate("/")}
                      >
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        <Label className="hidden sm:inline">Back to Home</Label>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Return to main view</TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}

            <div className="flex-1 overflow-auto">{children}</div>
          </div>
        </div>
        <Toaster position="top-center" closeButton />
      </TooltipProvider>
    </ThemeProvider>
  );
}
