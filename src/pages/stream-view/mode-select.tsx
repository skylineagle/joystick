import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Terminal, Video } from "lucide-react";
import { motion } from "motion/react";

interface ModeSelectProps {
  mode: "live" | "vmd" | "cmd";
  setMode: (mode: "live" | "vmd" | "cmd") => void;
}

export const ModeSelect = ({ mode, setMode }: ModeSelectProps) => {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <Card className="p-1.5 rounded-xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={mode === "live" ? "default" : "ghost"}
                onClick={() => setMode("live")}
                size="icon"
              >
                <Video className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              <p>Live Stream</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={mode === "vmd" ? "default" : "ghost"}
                onClick={() => setMode("vmd")}
                size="icon"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              <p>Motion Detection</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={mode === "cmd" ? "default" : "ghost"}
                onClick={() => setMode("cmd")}
                size="icon"
              >
                <Terminal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              <p>Command Mode</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </Card>
    </motion.div>
  );
};
