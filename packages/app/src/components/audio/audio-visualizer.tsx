import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  className?: string;
}

export const AudioVisualizer = ({
  isPlaying,
  className,
}: AudioVisualizerProps) => {
  const [bars, setBars] = useState<number[]>(Array(32).fill(0));

  useEffect(() => {
    let animationId: number;

    const animateBars = () => {
      if (isPlaying) {
        setBars((prev) =>
          prev.map(() => {
            const base = Math.random() * 0.3 + 0.1;
            const spike = Math.random() > 0.85 ? Math.random() * 0.6 : 0;
            return Math.min(base + spike, 1);
          })
        );
      } else {
        setBars((prev) => prev.map((bar) => Math.max(0, bar * 0.9)));
      }

      animationId = requestAnimationFrame(animateBars);
    };

    animationId = requestAnimationFrame(animateBars);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying]);

  return (
    <div className={cn("flex items-end justify-center gap-1 h-32", className)}>
      {bars.map((height, index) => (
        <motion.div
          key={index}
          className="bg-gradient-to-t from-primary/80 to-primary/20 rounded-t-sm"
          style={{
            width: "4px",
            height: `${Math.max(height * 100, 2)}%`,
          }}
          animate={{
            height: `${Math.max(height * 100, 2)}%`,
            opacity: isPlaying ? 1 : 0.3,
          }}
          transition={{
            duration: 0.1,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};
