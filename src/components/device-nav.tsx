import { Button } from "@/components/ui/button";
import { Icon } from "@/icons/icon";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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

export function DeviceNav() {
  const navigate = useNavigate();
  const { device } = useParams();
  const { pathname } = useLocation();

  const getIsActive = (path: string) => {
    if (path === "" && pathname === `/${device}`) return true;
    return pathname === `/${device}/${path}`;
  };

  return (
    <nav className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="mr-2 hover:bg-transparent"
          >
            <Icon icon="home" style={{ width: 24, height: 24 }} />
          </Button>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate(`/${device}${item.path ? `/${item.path}` : ""}`)
              }
              className={cn(
                "h-auto px-3 py-2 text-sm font-medium transition-colors",
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
      </div>
    </nav>
  );
}
