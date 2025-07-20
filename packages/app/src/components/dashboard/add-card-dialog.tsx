import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CardType,
  type CardConfig,
  type LocationCardConfig,
  type ParamValueEditorCardConfig,
  type StreamViewCardConfig,
} from "@/types/dashboard-cards";
import { useDevices } from "@/hooks/use-devices";
import {
  Plus,
  Search,
  Monitor,
  Battery,
  Signal,
  MapPin,
  Compass,
  Thermometer,
  Play,
  Settings,
  Wifi,
  Move3D,
  ArrowRight,
  X,
  ToggleLeft,
} from "lucide-react";
import MultipleSelector, { type Option } from "@/components/ui/multiselect";
import { devicesToOptions } from "@/lib/device-utils";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CARD_CATEGORIES = {
  monitoring: {
    name: "Monitoring",
    description: "Track device status and metrics",
    icon: Monitor,
    color: "bg-blue-500/10 border-blue-500/20 text-blue-600",
  },
  control: {
    name: "Control",
    description: "Interact with and control devices",
    icon: Settings,
    color: "bg-green-500/10 border-green-500/20 text-green-600",
  },
  media: {
    name: "Media",
    description: "Video streams and media content",
    icon: Play,
    color: "bg-purple-500/10 border-purple-500/20 text-purple-600",
  },
} as const;

type CardTypeInfo = {
  type: CardType;
  name: string;
  description: string;
  icon: any;
  category: keyof typeof CARD_CATEGORIES;
  tags: string[];
  requiresDevice: boolean;
  multiDevice: boolean;
};

const CARD_TYPES: CardTypeInfo[] = [
  {
    type: CardType.STREAM_VIEW,
    name: "Stream View",
    description: "Live video stream from device camera",
    icon: Monitor,
    category: "media",
    tags: ["video", "stream", "camera"],
    requiresDevice: true,
    multiDevice: false,
  },
  {
    type: CardType.BATTERY_STATUS,
    name: "Battery Status",
    description: "Monitor device battery level and health",
    icon: Battery,
    category: "monitoring",
    tags: ["battery", "power", "status"],
    requiresDevice: true,
    multiDevice: false,
  },
  {
    type: CardType.CELL_STATUS,
    name: "Cellular Status",
    description: "Track cellular signal strength and connectivity",
    icon: Signal,
    category: "monitoring",
    tags: ["cellular", "signal", "network"],
    requiresDevice: true,
    multiDevice: false,
  },
  {
    type: CardType.LOCATION,
    name: "Location Tracker",
    description: "View device locations on an interactive map",
    icon: MapPin,
    category: "monitoring",
    tags: ["location", "gps", "map"],
    requiresDevice: true,
    multiDevice: true,
  },
  {
    type: CardType.IMU_STATUS,
    name: "IMU Status",
    description: "Monitor inertial measurement unit data",
    icon: Compass,
    category: "monitoring",
    tags: ["imu", "orientation", "sensor"],
    requiresDevice: true,
    multiDevice: false,
  },
  {
    type: CardType.TEMPERATURE_STATUS,
    name: "Temperature Status",
    description: "Monitor device temperature and thermal status",
    icon: Thermometer,
    category: "monitoring",
    tags: ["temperature", "thermal", "status"],
    requiresDevice: true,
    multiDevice: false,
  },
  {
    type: CardType.ACTION_RUNNER,
    name: "Action Runner",
    description: "Execute predefined actions on devices",
    icon: Play,
    category: "control",
    tags: ["action", "execute", "control"],
    requiresDevice: true,
    multiDevice: false,
  },
  {
    type: CardType.PARAM_VALUE_EDITOR,
    name: "Parameter Editor",
    description: "Edit and monitor device parameters",
    icon: Settings,
    category: "control",
    tags: ["parameters", "config", "edit"],
    requiresDevice: true,
    multiDevice: false,
  },
  {
    type: CardType.PING_CONTROL,
    name: "Ping Control",
    description: "Test network connectivity and latency",
    icon: Wifi,
    category: "control",
    tags: ["ping", "network", "connectivity"],
    requiresDevice: true,
    multiDevice: false,
  },
  {
    type: CardType.PTZ_CONTROL,
    name: "PTZ Control",
    description: "Control pan, tilt, and zoom camera functions",
    icon: Move3D,
    category: "control",
    tags: ["ptz", "camera", "control"],
    requiresDevice: true,
    multiDevice: false,
  },
  {
    type: CardType.MODE_SELECTOR,
    name: "Mode Selector",
    description: "Switch between different device operation modes",
    icon: ToggleLeft,
    category: "control",
    tags: ["mode", "switch", "control"],
    requiresDevice: true,
    multiDevice: false,
  },
];

interface AddCardDialogProps {
  onAddCard: (config: Omit<CardConfig, "id">) => void;
  children?: React.ReactNode;
}

export const AddCardDialog = ({ onAddCard, children }: AddCardDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"select" | "configure">("select");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCardType, setSelectedCardType] = useState<CardTypeInfo | null>(
    null
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>();
  const [selectedDeviceOptions, setSelectedDeviceOptions] = useState<Option[]>(
    []
  );

  const { data: devices, isLoading: isLoadingDevices } = useDevices();
  const deviceOptions = devicesToOptions(devices);

  const filteredCardTypes = useMemo(() => {
    let filtered = CARD_TYPES;

    if (selectedCategory) {
      filtered = filtered.filter((card) => card.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.name.toLowerCase().includes(query) ||
          card.description.toLowerCase().includes(query) ||
          card.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const handleCardTypeSelect = (cardType: CardTypeInfo) => {
    setSelectedCardType(cardType);
    if (cardType.requiresDevice) {
      setStep("configure");
    } else {
      handleAddCard(cardType);
    }
  };

  const handleAddCard = (cardType: CardTypeInfo) => {
    if (!cardType) return;

    switch (cardType.type) {
      case CardType.LOCATION:
        onAddCard({
          type: CardType.LOCATION,
          deviceIds: selectedDeviceOptions.map((option) => option.value),
        } as Omit<LocationCardConfig, "id">);
        break;
      case CardType.PARAM_VALUE_EDITOR:
        if (!selectedDeviceId) return;
        onAddCard({
          type: CardType.PARAM_VALUE_EDITOR,
          deviceId: selectedDeviceId,
          paramKey: "",
          paramConfig: {
            type: "string",
            title: "",
          },
        } as Omit<ParamValueEditorCardConfig, "id">);
        break;
      default:
        if (!selectedDeviceId && cardType.requiresDevice) return;
        onAddCard({
          type: cardType.type,
          deviceId: selectedDeviceId,
        } as Omit<StreamViewCardConfig, "id">);
    }

    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep("select");
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedCardType(null);
    setSelectedDeviceId(undefined);
    setSelectedDeviceOptions([]);
  };

  const canProceed = () => {
    if (!selectedCardType) return false;
    if (!selectedCardType.requiresDevice) return true;

    if (selectedCardType.multiDevice) {
      return selectedDeviceOptions.length > 0;
    }

    return !!selectedDeviceId;
  };

  const CategoryFilter = () => (
    <div className="flex gap-2 mb-4">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        size="sm"
        onClick={() => setSelectedCategory(null)}
        className="h-8"
      >
        All Cards
      </Button>
      {Object.entries(CARD_CATEGORIES).map(([key, category]) => {
        const Icon = category.icon;
        return (
          <Button
            key={key}
            variant={selectedCategory === key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(key)}
            className="h-8"
          >
            <Icon className="w-3 h-3 mr-1" />
            {category.name}
          </Button>
        );
      })}
    </div>
  );

  const CardTypeGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {filteredCardTypes.map((cardType) => {
        const Icon = cardType.icon;
        const category =
          CARD_CATEGORIES[cardType.category as keyof typeof CARD_CATEGORIES];

        return (
          <motion.div
            key={cardType.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer"
            onClick={() => handleCardTypeSelect(cardType)}
          >
            <div className="group relative p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md bg-card">
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-md border", category.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {cardType.name}
                    </h4>
                    <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {cardType.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cardType.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5 h-auto"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const DeviceConfiguration = () => {
    if (!selectedCardType) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border">
          <div
            className={cn(
              "p-2 rounded-md border",
              CARD_CATEGORIES[
                selectedCardType.category as keyof typeof CARD_CATEGORIES
              ].color
            )}
          >
            <selectedCardType.icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-medium text-sm">{selectedCardType.name}</h4>
            <p className="text-xs text-muted-foreground">
              {selectedCardType.description}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {selectedCardType.multiDevice ? "Select Devices" : "Select Device"}
          </Label>

          {selectedCardType.multiDevice ? (
            <MultipleSelector
              value={selectedDeviceOptions}
              onChange={setSelectedDeviceOptions}
              defaultOptions={deviceOptions}
              placeholder="Choose devices for this card"
              commandProps={{
                label: "Select devices",
              }}
              hidePlaceholderWhenSelected
              emptyIndicator={
                <p className="text-center text-sm text-muted-foreground">
                  No devices found
                </p>
              }
            />
          ) : (
            <Select
              value={selectedDeviceId}
              onValueChange={setSelectedDeviceId}
              disabled={isLoadingDevices}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingDevices ? "Loading devices..." : "Choose a device"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {devices?.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      {device?.name || device.id}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon">
            <Plus className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                {step === "select" ? "Add New Card" : "Configure Card"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {step === "select"
                  ? "Choose a card type to add to your dashboard"
                  : "Configure your card settings"}
              </DialogDescription>
            </div>
            {step === "configure" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("select")}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            {step === "select" ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search card types..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <CategoryFilter />

                <ScrollArea className="h-[400px] pr-4">
                  <CardTypeGrid />
                </ScrollArea>
              </motion.div>
            ) : (
              <motion.div
                key="configure"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <DeviceConfiguration />

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setStep("select")}>
                    Back
                  </Button>
                  <Button
                    onClick={() =>
                      selectedCardType && handleAddCard(selectedCardType)
                    }
                    disabled={!canProceed()}
                  >
                    Add Card
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
