import { motion } from "motion/react";
import { Children, isValidElement, ReactNode } from "react";

interface StaggeredFadeProps {
  children: ReactNode;
  className?: string;
  staggerChildren?: number;
  delayChildren?: number;
}

export function StaggeredFade({
  children,
  className,
  staggerChildren = 0.1,
  delayChildren = 0.1,
}: StaggeredFadeProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;

        return (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                },
              },
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
