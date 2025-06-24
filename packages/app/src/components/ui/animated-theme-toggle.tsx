import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function AnimatedThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setColorMode, getActualColorMode } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleColorMode = () => {
    const actualMode = getActualColorMode();
    if (actualMode === "dark") {
      setColorMode("light");
    } else {
      setColorMode("dark");
    }
  };

  return (
    <motion.button
      className="relative inline-flex h-8 w-16 items-center rounded-full bg-muted p-1 shadow-inner dark:bg-muted"
      onClick={toggleColorMode}
      aria-label={`Switch to ${
        getActualColorMode() === "light" ? "dark" : "light"
      } mode`}
      data-testid="theme-toggle"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-background shadow-sm dark:bg-background"
        animate={{
          x: getActualColorMode() === "light" ? 0 : "calc(140% - 4px)",
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
      >
        <motion.div
          animate={{
            rotate: getActualColorMode() === "light" ? 180 : 0,
            scale: 1,
          }}
          initial={{ scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {getActualColorMode() === "light" ? (
            <Sun className="h-4 w-4 text-[hsl(var(--chart-4))]" />
          ) : (
            <Moon className="h-4 w-4 text-[hsl(var(--chart-1))]" />
          )}
        </motion.div>
      </motion.div>
      <span className="sr-only">
        {getActualColorMode() === "light" ? "Light mode" : "Dark mode"}
      </span>
    </motion.button>
  );
}
