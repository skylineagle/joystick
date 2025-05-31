import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import MultipleSelector, { Option } from "@/components/ui/multiselect";
import { Filter, Search } from "lucide-react";

interface NotificationFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  selectedDevices: Option[];
  onDevicesChange: (devices: Option[]) => void;
  selectedTypes: Option[];
  onTypesChange: (types: Option[]) => void;
  showUnreadOnly: boolean;
  onShowUnreadOnlyChange: (showUnreadOnly: boolean) => void;
  deviceOptions: Option[];
}

const typeOptions: Option[] = [
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
  { value: "emergency", label: "Emergency" },
];

export const NotificationFilters = ({
  search,
  onSearchChange,
  selectedDevices,
  onDevicesChange,
  selectedTypes,
  onTypesChange,
  showUnreadOnly,
  onShowUnreadOnlyChange,
  deviceOptions,
}: NotificationFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Devices</label>
            <MultipleSelector
              value={selectedDevices}
              onChange={onDevicesChange}
              options={deviceOptions}
              placeholder="Select devices..."
              emptyIndicator={
                <p className="text-center text-sm text-muted-foreground">
                  No devices found
                </p>
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Types</label>
            <MultipleSelector
              value={selectedTypes}
              onChange={onTypesChange}
              options={typeOptions}
              placeholder="Select types..."
              emptyIndicator={
                <p className="text-center text-sm text-muted-foreground">
                  No types found
                </p>
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="unread-only"
                checked={showUnreadOnly}
                onCheckedChange={(checked) =>
                  onShowUnreadOnlyChange(checked === true)
                }
              />
              <label htmlFor="unread-only" className="text-sm cursor-pointer">
                Show unread only
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
