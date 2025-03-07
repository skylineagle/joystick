import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout, useAuthStore } from "@/lib/auth";
import { urls } from "@/lib/urls";
import { LogOut } from "lucide-react";

export function UserProfile() {
  const { user, isAuthenticated } = useAuthStore();

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
      <DropdownMenuContent className="w-56" align="end">
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
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
