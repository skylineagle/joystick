import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { DeviceSettings } from "./device-settings";
import { GeneralSettings } from "./general-settings";
import { PermissionsSettings } from "./permissions-settings";
import { RunSettings } from "./run-settings";

export function SettingsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.email.startsWith("admin");

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex flex-col space-y-0.5">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Configure application settings and preferences
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <AnimatedThemeToggle />
        </div>
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="run">Run Configuration</TabsTrigger>
              <TabsTrigger value="devices">Device Management</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings like health check
                intervals and timeouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralSettings />
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="permissions">
              <PermissionsSettings />
            </TabsContent>

            <TabsContent value="run">
              <RunSettings />
            </TabsContent>

            <TabsContent value="devices">
              <DeviceSettings />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
