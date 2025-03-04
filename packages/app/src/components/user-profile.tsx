import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { urls } from "@/lib/urls";
import { logout, useAuthStore } from "@/lib/auth";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function UserProfile() {
  const { user, isAuthenticated } = useAuthStore();
  const [clickCount, setClickCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const clickTimerRef = useRef<NodeJS.Timer | null>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Reset click count after a delay
  useEffect(() => {
    if (clickCount > 0) {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }

      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 2000); // Reset after 2 seconds of inactivity
    }

    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, [clickCount]);

  // Check for easter egg trigger
  useEffect(() => {
    if (clickCount === 3) {
      triggerAvatarEasterEgg();
      setClickCount(0);
    }
  }, [clickCount]);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from opening immediately
    setClickCount((prev) => prev + 1);
  };

  const triggerAvatarEasterEgg = () => {
    setIsSpinning(true);

    // Show toast message
    toast.success("You found the secret avatar animation! 🎭", {
      duration: 3000,
    });

    // Stop spinning after animation completes
    setTimeout(() => {
      setIsSpinning(false);
    }, 3000);
  };

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
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full"
          onClick={handleAvatarClick}
        >
          <div
            ref={avatarRef}
            // onClick={handleAvatarClick}
            className={`${isSpinning ? "animate-spin-slow" : ""}`}
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
