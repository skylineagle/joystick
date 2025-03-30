import { useEffect, useState } from "react";

import { toast } from "@/utils/toast";

export function SlowMotionEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the secret key combination (Alt+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply slow motion effect when activated
  useEffect(() => {
    if (!isActive) {
      // Remove styles
      const styleElement = document.getElementById("slow-motion-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
      return;
    }

    // Show toast notification
    toast.success({ message: "Slow motion activated! ⏱️" });

    // Add CSS for slow motion effects
    const styleElement = document.createElement("style");
    styleElement.id = "slow-motion-style";
    styleElement.textContent = `
      /* Slow down all animations */
      *, *::before, *::after {
        animation-duration: 3s !important;
        animation-delay: 0s !important;
        animation-timing-function: ease-in-out !important;
        transition-duration: 3s !important;
        transition-delay: 0s !important;
        transition-timing-function: ease-in-out !important;
      }
      
      /* Add slow motion cursor trail */
      .cursor-trail {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.5);
        pointer-events: none;
        z-index: 9999;
        opacity: 0.7;
        transition: opacity 2s ease-out;
      }
      
      /* Slow down scrolling */
      html {
        scroll-behavior: smooth !important;
        scroll-timeline: 3s ease-in-out !important;
      }
      
      /* Add motion blur effect */
      @keyframes motionBlur {
        0% {
          filter: blur(0px);
        }
        50% {
          filter: blur(2px);
        }
        100% {
          filter: blur(0px);
        }
      }
      
      /* Apply motion blur to moving elements */
      button:hover, a:hover, input:focus, [class*="Button"]:hover, [class*="button"]:hover {
        animation: motionBlur 3s ease-in-out !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Add cursor trail effect
    const cursorTrails: HTMLDivElement[] = [];
    const maxTrails = 10;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive) return;

      // Create a new trail element
      const trail = document.createElement("div");
      trail.className = "cursor-trail";
      trail.style.left = `${e.clientX}px`;
      trail.style.top = `${e.clientY}px`;
      document.body.appendChild(trail);
      cursorTrails.push(trail);

      // Remove oldest trail if we have too many
      if (cursorTrails.length > maxTrails) {
        const oldestTrail = cursorTrails.shift();
        if (oldestTrail && oldestTrail.parentNode) {
          oldestTrail.parentNode.removeChild(oldestTrail);
        }
      }

      // Fade out and remove after delay
      setTimeout(() => {
        trail.style.opacity = "0";
        setTimeout(() => {
          if (trail.parentNode) {
            trail.parentNode.removeChild(trail);
          }
          const index = cursorTrails.indexOf(trail);
          if (index > -1) {
            cursorTrails.splice(index, 1);
          }
        }, 2000);
      }, 1000);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Set a timeout to deactivate after 30 seconds
    const timeout = setTimeout(() => {
      setIsActive(false);
      toast.success({ message: "Slow motion deactivated." });

      // Clean up any remaining cursor trails
      cursorTrails.forEach((trail) => {
        if (trail.parentNode) {
          trail.parentNode.removeChild(trail);
        }
      });
      cursorTrails.length = 0;
    }, 30 * 1000);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", handleMouseMove);

      // Clean up any remaining cursor trails
      cursorTrails.forEach((trail) => {
        if (trail.parentNode) {
          trail.parentNode.removeChild(trail);
        }
      });
    };
  }, [isActive]);

  return null;
}
