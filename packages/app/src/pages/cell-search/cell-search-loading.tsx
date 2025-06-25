import { Radio } from "lucide-react";
import { motion } from "motion/react";

export const CellSearchLoadingAnimation = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center p-12 space-y-6"
  >
    <div className="relative w-24 h-24">
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-primary/20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute inset-2 rounded-full border-3 border-primary/40"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
      />

      <motion.div
        className="absolute inset-4 rounded-full border-2 border-primary"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6,
        }}
      />

      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <Radio className="h-8 w-8 text-primary" />
      </motion.div>
    </div>

    <div className="text-center space-y-2">
      <motion.h3
        className="text-lg font-semibold"
        animate={{
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Scanning cellular networks
      </motion.h3>
      <motion.p
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Detecting nearby cell towers and analyzing signal strength
      </motion.p>

      <div className="flex justify-center space-x-1 pt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);
