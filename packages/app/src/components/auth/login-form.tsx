import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserProfile } from "@/components/user-profile";
import { login } from "@/lib/auth";
import { useState } from "react";
import { toast } from "@/utils/toast";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        toast.error({ message: result.error || "Failed to login" });
        return;
      }
      toast.success({ message: "Logged in successfully" });
    } catch {
      toast.error({ message: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-12 py-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Switcher Logo" className="h-16 w-16" />
            {/* <h1 className="text-3xl font-bold">HaTomer</h1> */}
          </div>

          <div className="flex items-center gap-5">
            <AnimatedThemeToggle />
            <UserProfile />
          </div>
        </div>

        <div className="flex-1 p-12">
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-[20vh] w-96 space-y-4 max-w-sm"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="email-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                data-testid="password-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              data-testid="login-button"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
