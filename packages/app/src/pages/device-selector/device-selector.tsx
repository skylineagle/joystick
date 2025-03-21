import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useDevices } from "@/hooks/use-devices";
import DOMPurify from "dompurify";
import { useNavigate } from "react-router";

export function DeviceSelector() {
  const navigate = useNavigate();
  const { data: devices, isLoading } = useDevices();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <img src="/logo.png" alt="logo" className="size-20" />
        Select a Device
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices?.map((device) => (
          <Card
            key={device.id}
            className="p-4 hover:bg-accent cursor-pointer transition-colors"
            onClick={() => navigate(`/${device.id}`)}
          >
            <h2 className="text-xl font-semibold">
              {device.name || "Unnamed Device"}
              <Badge variant="outline" className="ml-2">
                {device.expand?.device.name}
              </Badge>
            </h2>
            {device.description && (
              <div
                className="text-muted-foreground mt-2 prose prose-sm dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(device.description),
                }}
              />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
