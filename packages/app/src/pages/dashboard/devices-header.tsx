import { Checkbox } from "@/components/ui/checkbox";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useDeviceStore } from "@/store/device-store";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { memo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DeviceTableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;
}

export const DeviceTableHeader = memo(
  ({ onSelectAll, isAllSelected }: DeviceTableHeaderProps) => {
    const { sortState, setSortState } = useDeviceStore();

    return (
      <TableHeader>
        <TableRow>
          <TableHead className="w-[5%] px-0">
            <div className="pl-4">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
              />
            </div>
          </TableHead>
          <TableHead
            className="w-[10%] cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setSortState("name")}
          >
            <div className="flex items-center gap-2">
              Name
              {sortState.column === "name" && (
                <span
                  className={cn(
                    "transition-transform",
                    sortState.direction === "desc" && "rotate-180"
                  )}
                >
                  {sortState.direction ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </span>
              )}
            </div>
          </TableHead>
          <TableHead
            className="w-[20%] cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setSortState("mode")}
          >
            <div className="flex items-center gap-2">
              Mode
              {sortState.column === "mode" && (
                <span
                  className={cn(
                    "transition-transform",
                    sortState.direction === "desc" && "rotate-180"
                  )}
                >
                  {sortState.direction ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </span>
              )}
            </div>
          </TableHead>
          <TableHead className="w-[10%] cursor-pointer hover:bg-accent transition-colors">
            <div className="flex items-center gap-2">
              Auto
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  When enabled, the device will automatically switch between
                  modes based on the automation settings.
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead
            className="w-[10%] cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setSortState("status")}
          >
            <div className="flex items-center gap-2">
              Status
              {sortState.column === "status" && (
                <span
                  className={cn(
                    "transition-transform",
                    sortState.direction === "desc" && "rotate-180"
                  )}
                >
                  {sortState.direction ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </span>
              )}
            </div>
          </TableHead>
          <TableHead
            className="w-[20%] cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setSortState("automation")}
          >
            <div className="flex items-center gap-2">
              Automation
              {sortState.column === "automation" && (
                <span
                  className={cn(
                    "transition-transform",
                    sortState.direction === "desc" && "rotate-180"
                  )}
                >
                  {sortState.direction ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </span>
              )}
            </div>
          </TableHead>
          <TableHead className="w-[15%]">Actions</TableHead>
        </TableRow>
      </TableHeader>
    );
  }
);
