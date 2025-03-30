import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilterOptions } from "@/lib/hooks/use-filter-options";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, FilterX } from "lucide-react";

export type LoggerFilters = {
  fromDate?: string;
  toDate?: string;
  actionId?: string;
  deviceId?: string;
  userId?: string;
};

interface FilterBarProps {
  filters: LoggerFilters;
  onFiltersChange: (filters: LoggerFilters) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const { actions, devices, users } = useFilterOptions();

  const clearFilter = (key: keyof LoggerFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined
  );

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg shadow-sm bg-background">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={filters.fromDate ? "secondary" : "outline"}
            size="sm"
            className="h-8 text-xs font-normal"
          >
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
            {filters.fromDate
              ? format(new Date(filters.fromDate), "PP")
              : "From"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.fromDate ? new Date(filters.fromDate) : undefined}
            onSelect={(date) =>
              onFiltersChange({
                ...filters,
                fromDate: date?.toISOString(),
              })
            }
            initialFocus
          />
          {filters.fromDate && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => clearFilter("fromDate")}
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={filters.toDate ? "secondary" : "outline"}
            size="sm"
            className="h-8 text-xs font-normal"
          >
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
            {filters.toDate ? format(new Date(filters.toDate), "PP") : "To"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.toDate ? new Date(filters.toDate) : undefined}
            onSelect={(date) =>
              onFiltersChange({
                ...filters,
                toDate: date?.toISOString(),
              })
            }
            initialFocus
          />
          {filters.toDate && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => clearFilter("toDate")}
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Select
        value={filters.actionId}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            actionId: value === "*" ? undefined : value,
          })
        }
      >
        <SelectTrigger
          className={cn(
            "h-8 text-xs pl-3 pr-1 w-[120px]",
            filters.actionId && "bg-secondary"
          )}
        >
          <SelectValue placeholder="Action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="*">All actions</SelectItem>
          {actions.map((action) => (
            <SelectItem key={action.id} value={action.id}>
              {action.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.deviceId}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            deviceId: value === "*" ? undefined : value,
          })
        }
      >
        <SelectTrigger
          className={cn(
            "h-8 text-xs pl-3 pr-1 w-[120px]",
            filters.deviceId && "bg-secondary"
          )}
        >
          <SelectValue placeholder="Device" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="*">All devices</SelectItem>
          {devices.map((device) => (
            <SelectItem key={device.id} value={device.id}>
              {device.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.userId}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            userId: value === "*" ? undefined : value,
          })
        }
      >
        <SelectTrigger
          className={cn(
            "h-8 text-xs pl-3 pr-1 w-[120px]",
            filters.userId && "bg-secondary"
          )}
        >
          <SelectValue placeholder="User" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="*">All users</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 gap-1 text-xs ml-auto"
          >
            <FilterX className="h-3.5 w-3.5" />
            Clear
          </Button>
        </>
      )}
    </div>
  );
}
