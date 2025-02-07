import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Settings, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isParamsPage = location.pathname === "/params";

  return (
    <TooltipProvider>
      <div className="h-screen">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-3xl font-bold">Joystick</h1>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  {isParamsPage ? (
                    <Button
                      variant="ghost"
                      className="gap-2"
                      onClick={() => navigate("/")}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Home
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate("/params")}
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {isParamsPage ? "Return to main view" : "Open settings"}
                </TooltipContent>
              </Tooltip>
              <AnimatedThemeToggle />
            </div>
          </div>

          <div className="flex-1 p-12">{children}</div>
        </div>
      </div>
      <Toaster position="top-center" closeButton />
    </TooltipProvider>
  );
}
