import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";

export function MirrorEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the secret key combination (Alt+M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply mirror effect when activated
  useEffect(() => {
    if (!isActive) {
      // Remove styles
      const styleElement = document.getElementById("mirror-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
      return;
    }

    // Show toast notification
    toast.success({ message: "Mirror mode activated! 🪞" });

    // Add CSS for mirror effects
    const styleElement = document.createElement("style");
    styleElement.id = "mirror-style";
    styleElement.textContent = `
      /* Flip the entire UI horizontally */
      body {
        transform: scaleX(-1);
        transition: transform 0.5s ease-in-out;
      }
      
      /* Flip text back so it's readable */
      p, h1, h2, h3, h4, h5, h6, span, a, button, input, textarea, label, li, td, th {
        display: inline-block;
        transform: scaleX(-1);
      }
      
      /* Flip icons back */
      svg, img, i {
        transform: scaleX(-1);
      }
      
      /* Add a subtle mirror-like effect */
      body::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to right, 
          rgba(255, 255, 255, 0.05) 0%, 
          rgba(255, 255, 255, 0) 20%, 
          rgba(255, 255, 255, 0) 80%, 
          rgba(255, 255, 255, 0.05) 100%);
        pointer-events: none;
        z-index: 9999;
      }
      
      /* Add a subtle mirror frame */
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5);
        pointer-events: none;
        z-index: 9999;
      }
      
      /* Reverse animations */
      @keyframes reverse-spin {
        from {
          transform: rotate(0deg) scaleX(-1);
        }
        to {
          transform: rotate(-360deg) scaleX(-1);
        }
      }
      
      /* Apply reverse animations to spinning elements */
      .spinner, [class*="Spinner"], [class*="spinner"], [class*="Loading"], [class*="loading"] {
        animation: reverse-spin 1s linear infinite !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Set a timeout to deactivate after 30 seconds
    const timeout = setTimeout(() => {
      setIsActive(false);
      toast.success({ message: "Mirror mode deactivated." });
    }, 30 * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isActive]);

  return null;
}
