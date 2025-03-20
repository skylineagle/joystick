import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { runAction } from "@/lib/joystick-api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import "leaflet/dist/leaflet.css";
import { Maximize2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { z } from "zod";

// Fix for marker icons in react-leaflet
import L from "leaflet";

// Fix icon paths - this avoids TypeScript errors with image imports
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Type for map state
interface MapState {
  center: [number, number];
  zoom: number;
}

// Component to update marker position without resetting the view
const MarkerUpdater = ({ position }: { position: [number, number] }) => {
  const markerRef = useRef<L.Marker>(null);
  const map = useMap();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Set initial marker position
    if (markerRef.current && map && !isInitialized) {
      try {
        markerRef.current.setLatLng(position);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error setting initial marker position:", error);
      }
    }
  }, [map, isInitialized, position]);

  useEffect(() => {
    // Make sure the marker is initialized and map is ready
    if (markerRef.current && map && isInitialized) {
      try {
        // Safely update marker position
        requestAnimationFrame(() => {
          if (markerRef.current) {
            markerRef.current.setLatLng(position);

            // Update popup content if it's open
            const popup = markerRef.current.getPopup();
            if (popup && popup.isOpen()) {
              popup.setContent(`
                <div>
                  <strong>Lat:</strong> ${convertToDMS(position[0], "lat")}<br/>
                  <strong>Long:</strong> ${convertToDMS(position[1], "lng")}
                </div>
              `);
            }
          }
        });
      } catch (error) {
        console.error("Error updating marker position:", error);
      }
    }
  }, [position, map, isInitialized]);

  return (
    <Marker ref={markerRef} position={position}>
      <Popup>
        <div>
          <strong>Lat:</strong> {convertToDMS(position[0], "lat")}
          <br />
          <strong>Long:</strong> {convertToDMS(position[1], "lng")}
        </div>
      </Popup>
    </Marker>
  );
};

// Component to track map state changes
const MapStateTracker = ({
  onStateChange,
}: {
  onStateChange: (state: MapState) => void;
}) => {
  const map = useMapEvents({
    moveend: () => {
      try {
        const center = map.getCenter();
        onStateChange({
          center: [center.lat, center.lng],
          zoom: map.getZoom(),
        });
      } catch (error) {
        console.error("Error tracking map state:", error);
      }
    },
    zoomend: () => {
      try {
        const center = map.getCenter();
        onStateChange({
          center: [center.lat, center.lng],
          zoom: map.getZoom(),
        });
      } catch (error) {
        console.error("Error tracking map state:", error);
      }
    },
  });

  return null;
};

const gpsSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number().optional(),
  accuracy: z.number().optional(),
  timestamp: z.number().optional(),
});

// Convert decimal coordinates to degrees, minutes, seconds format
const convertToDMS = (coordinate: number, type: "lat" | "lng"): string => {
  if (coordinate === undefined || !isFinite(coordinate)) return "N/A";

  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

  const direction =
    type === "lat"
      ? coordinate >= 0
        ? "N"
        : "S"
      : coordinate >= 0
      ? "E"
      : "W";

  return `${degrees}°${minutes}'${seconds}"${direction}`;
};

// Format decimal coordinates for compact display
const formatCompactCoordinate = (
  value?: number,
  type: "lat" | "lng" = "lat"
): string => {
  if (value === undefined || !isFinite(value)) return "N/A";

  const direction =
    type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";

  return `${Math.abs(value).toFixed(4)}° ${direction}`;
};

// Custom hook to fetch GPS data using React Query
const useGetGPSData = (deviceId: string) => {
  return useQuery({
    queryKey: ["gps-data", deviceId],
    queryFn: async () => {
      const response = await runAction({
        deviceId,
        action: "get-gps",
      });

      // Parse response if it's a string
      const parsedResponse =
        typeof response === "string" ? JSON.parse(response) : response;

      // Validate against schema
      try {
        const validatedData = gpsSchema.parse(parsedResponse);
        return validatedData;
      } catch (error) {
        throw new Error(
          `Failed to fetch GPS data: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  });
};

export const GPSStatus = ({ deviceId }: { deviceId: string }) => {
  const { data: gpsData, isLoading, refetch } = useGetGPSData(deviceId);
  const [smallMapState, setSmallMapState] = useState<MapState | null>(null);
  const [largeMapState, setLargeMapState] = useState<MapState | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatAltitude = (value?: number) => {
    if (value === undefined) return "N/A";
    return `${value.toFixed(1)} m`;
  };

  const formatTimestamp = (timestamp?: number) => {
    if (timestamp === undefined) return new Date().toLocaleTimeString();
    return new Date(timestamp).toLocaleTimeString();
  };

  const Map = ({
    height = "100%",
    initialZoom = 15,
    showControls = false,
    isLargeMap = false,
  }) => {
    // Get appropriate state based on map size
    const mapState = isLargeMap ? largeMapState : smallMapState;
    const setMapState = isLargeMap ? setLargeMapState : setSmallMapState;

    // Create a stable map component that won't cause flickering on re-renders
    const mapComponent = useMemo(() => {
      if (
        !gpsData ||
        typeof gpsData.latitude !== "number" ||
        typeof gpsData.longitude !== "number"
      ) {
        return (
          <div
            style={{ height, width: "100%" }}
            className="flex items-center justify-center bg-muted/30 text-muted-foreground text-sm"
          >
            Map unavailable
          </div>
        );
      }

      // Determine initial center and zoom, respecting saved state
      const center = mapState?.center || [gpsData.latitude, gpsData.longitude];
      const zoom = mapState?.zoom || initialZoom;

      // Prevent rendering the map with invalid coordinates
      if (!isFinite(center[0]) || !isFinite(center[1])) {
        return (
          <div
            style={{ height, width: "100%" }}
            className="flex items-center justify-center bg-muted/30 text-muted-foreground text-sm"
          >
            Invalid coordinates
          </div>
        );
      }

      return (
        <MapContainer
          key={`map-${isLargeMap ? "large" : "small"}`}
          center={center}
          zoom={zoom}
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
          <MarkerUpdater position={[gpsData.latitude, gpsData.longitude]} />
          <MapStateTracker onStateChange={setMapState} />
        </MapContainer>
      );
    }, [mapState, initialZoom, isLargeMap, height, showControls, setMapState]);

    return mapComponent;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">GPS Location</Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(gpsData?.timestamp)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>

      {isLoading && !gpsData ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          Loading GPS data...
        </div>
      ) : !gpsData ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No GPS data available
        </div>
      ) : (
        <div className="grid gap-3 items-center">
          {/* Map Component */}
          <div className="relative h-40 w-full rounded-md overflow-hidden border">
            <Map height="100%" initialZoom={15} />
            <div className="absolute top-2 right-2 z-[1000] transform-gpu">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-1 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all duration-200 transform-gpu"
                    style={{
                      WebkitBackfaceVisibility: "hidden",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <Maximize2 className="h-4 w-4" />
                    <span className="sr-only">Expand map</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <div className="h-[350px] w-full rounded-md overflow-hidden">
                    <Map
                      height="350px"
                      initialZoom={14}
                      showControls
                      isLargeMap
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* GPS Information Card */}
          <div className="flex items-center gap-1 justify-center">
            {/* <Compass className="h-4 w-4 text-primary" /> */}
            <div className="flex gap-1 items-center">
              <span className="text-xs font-mono">
                {formatCompactCoordinate(gpsData.latitude, "lat")}
              </span>
              {/* <span className="text-muted-foreground">•</span> */}
              <span className="text-xs font-mono">/</span>
              <span className="text-xs font-mono">
                {formatCompactCoordinate(gpsData.longitude, "lng")}
              </span>
              <span className="text-xs font-mono">/</span>
              {/* <span className="text-muted-foreground">•</span> */}
              <span className="text-xs font-mono">
                {formatAltitude(gpsData.altitude)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
