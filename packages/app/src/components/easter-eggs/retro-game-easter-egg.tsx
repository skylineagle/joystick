import { toast } from "@/utils/toast";
import { useEffect, useState } from "react";

export function RetroGameEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the F1 key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply retro game effect when activated
  useEffect(() => {
    if (!isActive) {
      // Remove any existing retro styles
      const styleElement = document.getElementById("retro-game-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
      return;
    }

    // Show toast notification
    toast.success({
      message: "Retro Game Mode activated! 🎮 Press F1 again to deactivate.",
    });

    // Add CSS for retro game effect
    const styleElement = document.createElement("style");
    styleElement.id = "retro-game-style";
    styleElement.textContent = `
      :root {
        --retro-primary: #39ff14;
        --retro-secondary: #ff00ff;
        --retro-background: #000033;
        --retro-accent: #ffcc00;
      }
      
      body {
        font-family: 'Press Start 2P', 'Courier New', monospace !important;
        background-color: var(--retro-background) !important;
        color: var(--retro-primary) !important;
        text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.8) !important;
        position: relative;
      }
      
      body::before {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
          0deg,
          rgba(0, 0, 0, 0.15),
          rgba(0, 0, 0, 0.15) 1px,
          transparent 1px,
          transparent 2px
        );
        pointer-events: none;
        z-index: 9999;
      }
      
      button, input, select, textarea {
        background-color: var(--retro-background) !important;
        color: var(--retro-primary) !important;
        border: 2px solid var(--retro-primary) !important;
        box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.5) !important;
      }
      
      button:hover, input:focus, select:focus, textarea:focus {
        background-color: var(--retro-primary) !important;
        color: var(--retro-background) !important;
      }
      
      h1, h2, h3, h4, h5, h6 {
        color: var(--retro-accent) !important;
        text-transform: uppercase;
      }
      
      a {
        color: var(--retro-secondary) !important;
        text-decoration: none !important;
      }
      
      a:hover {
        color: var(--retro-accent) !important;
        text-decoration: underline !important;
      }
      
      /* Add pixelated transitions */
      * {
        transition: all 0.1s steps(5) !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Set a timeout to deactivate after 2 minutes
    const timeout = setTimeout(() => {
      setIsActive(false);
      toast.success({ message: "Retro Game Mode deactivated." });
    }, 2 * 60 * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isActive]);

  return null;
}
