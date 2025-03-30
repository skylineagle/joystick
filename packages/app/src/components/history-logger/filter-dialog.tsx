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
import { Separator } from "@/components/ui/separator";
import { useFilterOptions } from "@/lib/hooks/use-filter-options";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarIcon, ChevronDown, X } from "lucide-react";

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

  const handleReset = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 rounded-lg border bg-card/50 backdrop-blur-sm p-2 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 justify-start text-left font-normal transition-all duration-200 hover:bg-accent/50",
                !filters.fromDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
              {filters.fromDate ? (
                format(new Date(filters.fromDate), "PP")
              ) : (
                <span>From</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={
                filters.fromDate ? new Date(filters.fromDate) : undefined
              }
              onSelect={(date) =>
                onFiltersChange({
                  ...filters,
                  fromDate: date?.toISOString(),
                })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 justify-start text-left font-normal transition-all duration-200 hover:bg-accent/50",
                !filters.toDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
              {filters.toDate ? (
                format(new Date(filters.toDate), "PP")
              ) : (
                <span>To</span>
              )}
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
          </PopoverContent>
        </Popover>
      </div>
      <Separator orientation="vertical" className="h-6 bg-border/50" />
      <div className="flex items-center gap-2">
        <Select
          value={filters.actionId}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              actionId: value || undefined,
            })
          }
        >
          <SelectTrigger className="h-8 w-[140px] transition-all duration-200 hover:bg-accent/50">
            <SelectValue placeholder="Action" />
            <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </SelectTrigger>
          <SelectContent>
            {actions.map((action) => (
              <SelectItem
                key={action.id}
                value={action.id}
                className="transition-colors duration-200 hover:bg-accent/50"
              >
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
              deviceId: value || undefined,
            })
          }
        >
          <SelectTrigger className="h-8 w-[140px] transition-all duration-200 hover:bg-accent/50">
            <SelectValue placeholder="Device" />
            <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem
                key={device.id}
                value={device.id}
                className="transition-colors duration-200 hover:bg-accent/50"
              >
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
              userId: value || undefined,
            })
          }
        >
          <SelectTrigger className="h-8 w-[140px] transition-all duration-200 hover:bg-accent/50">
            <SelectValue placeholder="User" />
            <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem
                key={user.id}
                value={user.id}
                className="transition-colors duration-200 hover:bg-accent/50"
              >
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            <Separator orientation="vertical" className="h-6 bg-border/50" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
