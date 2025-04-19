import { BoxScene } from "@/components/3d/box-scene";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { useIMUStatus } from "@/hooks/use-imu-status";
import { IMUStatusCardConfig } from "@/types/dashboard-cards";
import { RotateCw } from "lucide-react";

interface IMUStatusCardProps {
  config: IMUStatusCardConfig;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
}

export function IMUStatusCard({
  config,
  isEditing,
  onEdit,
}: IMUStatusCardProps) {
  const {
    data: imuData,
    isLoading,
    error,
    refetch,
  } = useIMUStatus(config.deviceId);

  return (
    <DashboardCard
      config={{
        ...config,
        visualizationType: "IMU Status",
      }}
      isEditing={isEditing}
      onEdit={onEdit}
    >
      <CardContent className="relative flex flex-col items-center justify-center h-full p-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="absolute top-2 right-2 size-4 z-20"
        >
          <RotateCw className="size-4" />
        </Button>

        {isLoading && <div>Loading IMU data...</div>}
        {error && <div>Error loading IMU data: {error.message}</div>}
        {imuData && (
          <>
            <BoxScene imuData={imuData} />
            <div className="mt-4 text-sm text-muted-foreground">
              X: {imuData.x.toFixed(2)}° Y: {imuData.y.toFixed(2)}° Z:{" "}
              {imuData.z.toFixed(2)}°
            </div>
          </>
        )}
      </CardContent>
    </DashboardCard>
  );
}
