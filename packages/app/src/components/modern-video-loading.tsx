import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const barColors = "from-primary to-primary-foreground";
const textColors = "text-gray-700 dark:text-gray-300";
const dotColors = "bg-primary";
const progressBgStroke = "stroke-primary-foreground/30";
const progressStroke = "stroke-primary";

export const ModernVideoLoading = () => (
  <div
    className="flex items-center justify-center size-full"
    role="status"
    aria-live="polite"
  >
    <motion.div
      className="flex flex-col items-center justify-center bg-transparent"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-end justify-center h-16 gap-1.5 mb-5">
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 rounded-full bg-gradient-to-t ${barColors}`}
            initial={{ height: 10 }}
            animate={{ height: [10, 40 + Math.random() * 20, 10] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 1.2 + Math.random() * 0.8,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Circular progress */}
      <div className="relative w-16 h-16 mb-5">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            className={progressBgStroke}
            strokeWidth="8"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            className={progressStroke}
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0, rotate: -90 }}
            animate={{
              pathLength: [0, 0.5, 1, 0],
              rotate: ["-90deg", "270deg"],
            }}
            transition={{
              pathLength: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 4,
                ease: "easeInOut",
              },
              rotate: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 8,
                ease: "linear",
              },
            }}
            style={{ transformOrigin: "center" }}
          />
        </svg>

        {/* Pulsing dot in center */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 2,
            ease: "easeInOut",
          }}
        >
          <div className={`w-3 h-3 rounded-full ${dotColors}`} />
        </motion.div>
      </div>

      {/* Text with animated dots */}
      <div className={cn("flex items-center text-sm font-medium", textColors)}>
        <span>Loading video</span>
        <div className="flex ml-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.5,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            >
              .
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  </div>
);
