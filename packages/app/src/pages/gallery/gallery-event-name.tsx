import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface GalleryEventNameProps {
  name: string;
  eventId: string;
  className?: string;
}

const getFileName = (fullPath: string) => {
  if (!fullPath) return "";
  // Handle both forward and backward slashes
  const parts = fullPath.split(/[/\\]/);
  return parts[parts.length - 1] || fullPath;
};

export const GalleryEventName = ({
  name,
  eventId,
  className,
}: GalleryEventNameProps) => {
  const fileName = getFileName(name);
  const fullPath = name;

  // If the filename is the same as the full path, no need for tooltip
  if (fileName === fullPath) {
    return (
      <span className={cn("font-medium truncate", className)}>
        {fileName || eventId}
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("font-medium truncate cursor-help", className)}>
          {fileName || eventId}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs break-all">{fullPath}</p>
      </TooltipContent>
    </Tooltip>
  );
};
