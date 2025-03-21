import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout, useAuthStore } from "@/lib/auth";
import { urls } from "@/lib/urls";
import { Computer, LogOut, Moon, Palette, Settings, Sun } from "lucide-react";
import { Link } from "react-router";

const colorModeIcons = {
  light: <Sun className="h-4 w-4" />,
  dark: <Moon className="h-4 w-4" />,
  system: <Computer className="h-4 w-4" />,
};

const designThemeInfo = {
  default: {
    name: "Classic",
    color: "hsl(260, 50%, 50%)",
    description: "Elegant, balanced design with rounded corners",
    radius: "0.8rem",
  },
  purple: {
    name: "Neon",
    color: "hsl(280, 100%, 65%)",
    description: "Vibrant cyberpunk-inspired design with bold accents",
    radius: "1.5rem",
  },
  blue: {
    name: "Ocean",
    color: "hsl(200, 100%, 45%)",
    description: "Clean, modern oceanic design with a splash of color",
    radius: "0.5rem",
  },
  green: {
    name: "Nature",
    color: "hsl(140, 70%, 35%)",
    description: "Organic, earthy aesthetic with natural tones",
    radius: "0.25rem",
  },
};

export function UserProfile() {
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = user?.email.startsWith("admin");
  const { colorMode, designTheme, setColorMode, setDesignTheme } = useTheme();

  if (!isAuthenticated || !user) return null;

  const initials = user.username
    ? user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <div
            style={{
              transition: "all 0.3s ease",
              transformOrigin: "center center",
            }}
          >
            <Avatar>
              <AvatarImage
                src={`${urls.pocketbase}/api/files/${user.collectionId}/${user.id}/${user.avatar}`}
                alt={user.username || user.email}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            {user.username && (
              <p className="text-sm font-medium leading-none">
                {user.username}
              </p>
            )}
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Color Mode Selection */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun className="mr-2 h-4 w-4" />
            <span>Color Mode</span>
            <div className="ml-auto flex h-4 w-4 items-center justify-center">
              {colorModeIcons[colorMode]}
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={colorMode}
              onValueChange={(value) =>
                setColorMode(value as "light" | "dark" | "system")
              }
            >
              <DropdownMenuRadioItem
                value="light"
                className="flex items-center gap-2"
              >
                {colorModeIcons.light}
                <span>Light</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="dark"
                className="flex items-center gap-2"
              >
                {colorModeIcons.dark}
                <span>Dark</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="system"
                className="flex items-center gap-2"
              >
                {colorModeIcons.system}
                <span>System</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Design Theme Selection */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>Design Theme</span>
            <div className="ml-auto flex h-4 w-4 items-center justify-center">
              <div
                className="h-4 w-4 rounded-full border"
                style={{
                  backgroundColor: designThemeInfo[designTheme].color,
                  borderRadius: designThemeInfo[designTheme].radius,
                }}
              />
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            <DropdownMenuRadioGroup
              value={designTheme}
              onValueChange={(value) =>
                setDesignTheme(value as "default" | "purple" | "blue" | "green")
              }
            >
              {Object.entries(designThemeInfo).map(([key, info]) => (
                <DropdownMenuRadioItem
                  key={key}
                  value={key}
                  className="flex flex-col items-start py-2 px-2"
                >
                  <div className="flex items-center w-full mb-1">
                    <div
                      className="h-4 w-4 mr-2 border"
                      style={{
                        backgroundColor: info.color,
                        borderRadius: info.radius,
                      }}
                    />
                    <span className="font-medium">{info.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground pl-6">
                    {info.description}
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link
              to="/settings"
              className="flex items-center w-full cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
