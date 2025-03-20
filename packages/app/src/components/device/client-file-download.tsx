import { Button } from "@/components/ui/button";
import { pb } from "@/lib/pocketbase";
import { DeviceResponse } from "@/types/types";
import { useCallback } from "react";
import { Download } from "lucide-react";
import { toast } from "@/utils/toast";

interface ClientFileDownloadProps {
  device: DeviceResponse;
}

export function ClientFileDownload({ device }: ClientFileDownloadProps) {
  const handleDownload = useCallback(() => {
    if (!device.client) {
      toast.error({
        message: "This device doesn't have a client file to download.",
      });
      return;
    }

    // Get the file URL from PocketBase
    const fileUrl = pb.files.getURL(device, device.client, { download: true });

    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [device]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDownload}
      title="Download client"
      disabled={!device.client}
    >
      <Download className="h-4 w-4" />
    </Button>
  );
}
