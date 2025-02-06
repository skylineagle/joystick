import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: AppLayoutProps) {
  return (
    <TooltipProvider>
      <div className="h-screen">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Joystick</h1>

            {/* <div className="flex items-center gap-5"> */}
            <AnimatedThemeToggle />
            {/* </div> */}
          </div>

          <div className="flex-1 p-12">{children}</div>
        </div>
      </div>
      <Toaster position="top-center" closeButton />
    </TooltipProvider>
  );
}
