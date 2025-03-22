import { urls } from "@/lib/urls";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Download,
  Loader2,
} from "lucide-react";
import { FC } from "react";
import { GalleryStats as GalleryStatsType } from "./gallery-page";

interface GalleryStatsProperties {
  deviceId: string;
}

export const GalleryStats: FC<GalleryStatsProperties> = ({ deviceId }) => {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["gallery", "stats", deviceId],
    queryFn: async () => {
      const response = await fetch(
        `${urls.studio}/api/gallery/${deviceId}/stats`
      );
      if (!response.ok) throw new Error("Failed to fetch gallery stats");
      const data = await response.json();
      return data.stats as GalleryStatsType;
    },
  });

  if (isLoadingStats) return <Loader2 className="h-5 w-5 animate-spin" />;

  return (
    <div className="flex items-center space-x-6">
      {/* New Events - Most Important */}
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-5 w-5 text-yellow-500" />
        <div className="text-lg font-semibold text-yellow-500">
          {stats?.newEvents || 0}
        </div>
        <div className="text-sm text-muted-foreground">New</div>
      </div>

      {/* Pulled Events - Secondary Importance */}
      <div className="flex items-center space-x-2">
        <Download className="h-5 w-5 text-blue-500" />
        <div className="text-lg font-medium text-blue-500">
          {stats?.pulledEvents || 0}
        </div>
        <div className="text-sm text-muted-foreground">Pulled</div>
      </div>

      {/* Viewed Events - Least Important */}
      <div className="flex items-center space-x-2 opacity-60">
        <CheckCircle2 className="h-5 w-5 text-gray-400" />
        <div className="text-lg font-medium text-gray-400">
          {stats?.viewedEvents || 0}
        </div>
        <div className="text-sm text-muted-foreground">Viewed</div>
      </div>

      {/* Total Events - Context */}
      <div className="flex items-center space-x-2">
        <Camera className="h-5 w-5 text-primary" />
        <div className="text-lg font-medium">{stats?.totalEvents || 0}</div>
        <div className="text-sm text-muted-foreground">Total</div>
      </div>
    </div>
  );
};
