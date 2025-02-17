import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/icons/icon";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSidebar } from "./sidebar-provider";

const navItems = [
  {
    label: "Stream",
    icon: "video" as const,
    path: "",
    description: "Live video stream and controls",
  },
  {
    label: "Parameters",
    icon: "settings" as const,
    path: "params",
    description: "Device parameters and configuration",
  },
  {
    label: "Actions",
    icon: "send" as const,
    path: "actions",
    description: "Execute device actions",
  },
  {
    label: "Terminal",
    icon: "terminal" as const,
    path: "terminal",
    description: "Device terminal access",
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { device } = useParams();
  const { pathname } = useLocation();
  const { isOpen } = useSidebar();

  const getIsActive = (path: string) => {
    if (path === "" && pathname === `/${device}`) return true;
    return pathname === `/${device}/${path}`;
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300",
        !isOpen && "-translate-x-full"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-transparent"
        >
          <Icon icon="home" style={{ width: 24, height: 24 }} />
        </Button>
      </div>

      <ScrollArea className="flex-1 py-2">
        <div className="space-y-1 px-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate(`/${device}${item.path ? `/${item.path}` : ""}`)
              }
              className={cn(
                "w-full justify-start px-3 py-2 text-sm font-medium transition-colors",
                getIsActive(item.path)
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "hover:bg-muted"
              )}
            >
              <div className="mr-2 opacity-70">
                <Icon icon={item.icon} style={{ width: 16, height: 16 }} />
              </div>
              {item.label}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
