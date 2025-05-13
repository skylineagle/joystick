import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useDevices } from "@/hooks/use-devices";
import { useGPSStatus } from "@/hooks/use-gps-status";
import { cn } from "@/lib/utils";
import { convertToDMS, DefaultIcon } from "@/pages/status/gps-status";
import type { LocationCardConfig } from "@/types/dashboard-cards";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import { BaseCard } from "./base-card";

L.Marker.prototype.options.icon = DefaultIcon;

// Type for map state
interface MapState {
  center: [number, number];
  zoom: number;
}

// Component to track map state changes
const MapStateTracker = ({
  onStateChange,
}: {
  onStateChange: (state: MapState) => void;
}) => {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onStateChange({
        center: [center.lat, center.lng],
        zoom: map.getZoom(),
      });
    },
    zoomend: () => {
      const center = map.getCenter();
      onStateChange({
        center: [center.lat, center.lng],
        zoom: map.getZoom(),
      });
    },
  });

  return null;
};

interface LocationCardProps {
  config: LocationCardConfig;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
  hideDeviceBadge?: boolean;
}

export const LocationCard = ({
  config,
  isEditing,
  onEdit,
  hideDeviceBadge = true,
}: LocationCardProps) => {
  const { data: devices } = useDevices();
  const gpsQueries = useGPSStatus(config.deviceIds);
  const [smallMapState, setSmallMapState] = useState<MapState | null>(null);
  const [largeMapState, setLargeMapState] = useState<MapState | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get device names for the popup
  const deviceNames = useMemo(() => {
    if (!devices) return {};
    return devices.reduce((acc, device) => {
      acc[device.id] = device?.name || device.id;
      return acc;
    }, {} as Record<string, string>);
  }, [devices]);

  const validLocations = useMemo(() => {
    return gpsQueries
      .map((query) => query.data)
      .filter((data): data is NonNullable<typeof data> => !!data)
      .filter(
        (data) =>
          typeof data.latitude === "number" &&
          typeof data.longitude === "number"
      );
  }, [gpsQueries]);

  const getBounds = () => {
    if (validLocations.length === 0) return null;
    if (validLocations.length === 1) {
      const location = validLocations[0];
      return L.latLngBounds(
        [location.latitude - 0.1, location.longitude - 0.1],
        [location.latitude + 0.1, location.longitude + 0.1]
      );
    }
    return L.latLngBounds(
      validLocations.map((loc) => [loc.latitude, loc.longitude])
    );
  };

  const Map = ({
    height = "100%",
    showControls = false,
    isLargeMap = false,
  }) => {
    const bounds = getBounds();
    const mapState = isLargeMap ? largeMapState : smallMapState;
    const setMapState = isLargeMap ? setLargeMapState : setSmallMapState;

    if (validLocations.length === 0) {
      return (
        <div
          style={{ height, width: "100%" }}
          className="flex items-center justify-center bg-muted/30 text-muted-foreground text-sm"
        >
          No location data available
        </div>
      );
    }

    const center = mapState?.center || [
      validLocations[0].latitude,
      validLocations[0].longitude,
    ];
    const zoom = mapState?.zoom || (isLargeMap ? 12 : 10);

    return (
      <MapContainer
        key={`map-${isLargeMap ? "large" : "small"}`}
        center={center}
        zoom={zoom}
        bounds={bounds || undefined}
        style={{ height, width: "100%" }}
        className={cn(
          "leaflet-container",
          "transform-gpu",
          "transition-opacity",
          isLargeMap ? "large-map" : "small-map"
        )}
        zoomControl={showControls}
        attributionControl={showControls}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {validLocations.map((location) => (
          <Marker
            key={location.deviceId}
            position={[location.latitude, location.longitude]}
          >
            <Tooltip
              direction="top"
              offset={[0, -20]}
              opacity={0.9}
              permanent
              className="bg-background text-foreground border-border"
            >
              {deviceNames[location.deviceId] || location.deviceId}
            </Tooltip>
            <Popup>
              <div className="space-y-1">
                <div className="font-medium">
                  {deviceNames[location.deviceId] || location.deviceId}
                </div>
                <div className="text-xs">
                  <div>
                    <strong>Lat:</strong>{" "}
                    {convertToDMS(location.latitude, "lat")}
                  </div>
                  <div>
                    <strong>Long:</strong>{" "}
                    {convertToDMS(location.longitude, "lng")}
                  </div>
                  {location.altitude && (
                    <div>
                      <strong>Alt:</strong> {location.altitude.toFixed(1)}m
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapStateTracker onStateChange={setMapState} />
      </MapContainer>
    );
  };

  return (
    <BaseCard
      config={config}
      isEditing={isEditing}
      onEdit={onEdit}
      hideDeviceBadge={hideDeviceBadge}
    >
      <div className="flex flex-col h-full space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Tracking {validLocations.length} device(s)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => gpsQueries.forEach((query) => query.refetch())}
              disabled={gpsQueries.some((q) => q.isLoading)}
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  gpsQueries.some((q) => q.isLoading || q.isRefetching) &&
                    "animate-spin"
                )}
              />
              <span className="sr-only">Refresh</span>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Maximize2 className="h-4 w-4" />
                  <span className="sr-only">Expand map</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-[90vw]">
                <div className="h-[70vh]">
                  <Map height="100%" showControls isLargeMap />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <Map height="100%" />
        </div>
      </div>
    </BaseCard>
  );
};
