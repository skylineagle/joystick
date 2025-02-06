import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function AnimatedThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <motion.button
      className="relative inline-flex h-8 w-16 items-center rounded-full bg-muted p-1 shadow-inner dark:bg-muted"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute flex h-6 w-6 items-center justify-center rounded-full bg-background shadow-sm dark:bg-background"
        animate={{
          x: theme === "light" ? 0 : "calc(140% - 4px)",
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
      >
        <motion.div
          animate={{
            rotate: theme === "light" ? 180 : 0,
            scale: 1,
          }}
          initial={{ scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {theme === "light" ? (
            <Sun className="h-4 w-4 text-[hsl(var(--chart-4))]" />
          ) : (
            <Moon className="h-4 w-4 text-[hsl(var(--chart-1))]" />
          )}
        </motion.div>
      </motion.div>
      <span className="sr-only">
        {theme === "light" ? "Light mode" : "Dark mode"}
      </span>
    </motion.button>
  );
}
