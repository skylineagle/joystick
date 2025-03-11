import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";

export function NeonEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the secret key combination (F12)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply neon effect when activated
  useEffect(() => {
    if (!isActive) {
      // Remove styles
      const styleElement = document.getElementById("neon-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }

      // Remove any added elements
      const neonOverlay = document.getElementById("neon-overlay");
      if (neonOverlay) {
        document.body.removeChild(neonOverlay);
      }

      return;
    }

    // Show toast notification
    toast.success({ message: "Enhanced neon mode activated! 🌈" });

    // Create neon overlay for additional effects
    const neonOverlay = document.createElement("div");
    neonOverlay.id = "neon-overlay";
    neonOverlay.style.position = "fixed";
    neonOverlay.style.top = "0";
    neonOverlay.style.left = "0";
    neonOverlay.style.width = "100%";
    neonOverlay.style.height = "100%";
    neonOverlay.style.pointerEvents = "none";
    neonOverlay.style.zIndex = "9997";
    document.body.appendChild(neonOverlay);

    // Add random neon lines
    const lineCount = 15;
    for (let i = 0; i < lineCount; i++) {
      const line = document.createElement("div");
      line.className = "neon-line";
      line.style.position = "absolute";
      line.style.height = "1px";
      line.style.width = `${Math.random() * 200 + 50}px`;
      line.style.top = `${Math.random() * 100}%`;
      line.style.left = `${Math.random() * 100}%`;
      line.style.transform = `rotate(${Math.random() * 360}deg)`;
      line.style.opacity = "0";
      line.style.boxShadow = "0 0 8px 2px var(--line-color, #ff00ff)";
      line.style.background = "var(--line-color, #ff00ff)";
      line.style.animation = `neon-line-fade ${
        Math.random() * 3 + 2
      }s ease-in-out infinite alternate`;
      line.style.animationDelay = `${Math.random() * 2}s`;
      neonOverlay.appendChild(line);
    }

    // Add CSS for neon effects
    const styleElement = document.createElement("style");
    styleElement.id = "neon-style";
    styleElement.textContent = `
      /* Neon text effect for headings with color cycling */
      h1, h2, h3, h4, h5, h6, .neon-text {
        text-shadow: 0 0 5px rgba(255,255,255,0.8), 
                     0 0 10px rgba(255,255,255,0.5), 
                     0 0 15px var(--neon-color, #ff00de), 
                     0 0 20px var(--neon-color, #ff00de), 
                     0 0 30px var(--neon-color, #ff00de), 
                     0 0 40px var(--neon-color, #ff00de) !important;
        animation: neon-text-color-cycle 8s linear infinite !important;
      }
      
      /* Neon border effect for buttons and cards with color cycling */
      button, .card, [class*="Card"], [class*="Button"], [class*="button"], 
      input, select, textarea, .neon-border {
        box-shadow: 0 0 5px rgba(255,255,255,0.8), 
                    0 0 10px rgba(255,255,255,0.5), 
                    0 0 15px var(--neon-color, #00ffff), 
                    0 0 20px var(--neon-color, #00ffff) !important;
        border-color: var(--neon-color, #00ffff) !important;
        animation: neon-border-color-cycle 5s linear infinite !important;
        transition: all 0.3s ease !important;
      }
      
      /* Hover effect for interactive elements */
      button:hover, [class*="Button"]:hover, [class*="button"]:hover, 
      a:hover, .neon-border:hover {
        box-shadow: 0 0 5px rgba(255,255,255,0.8), 
                    0 0 10px rgba(255,255,255,0.5), 
                    0 0 15px var(--neon-color-hover, #ff9500), 
                    0 0 20px var(--neon-color-hover, #ff9500), 
                    0 0 30px var(--neon-color-hover, #ff9500) !important;
        border-color: var(--neon-color-hover, #ff9500) !important;
        animation: neon-hover-color-cycle 3s linear infinite !important;
      }
      
      /* Color cycling animations */
      @keyframes neon-text-color-cycle {
        0% { --neon-color: #ff00de; }
        16.6% { --neon-color: #ff0000; }
        33.3% { --neon-color: #ffff00; }
        50% { --neon-color: #00ff00; }
        66.6% { --neon-color: #00ffff; }
        83.3% { --neon-color: #0000ff; }
        100% { --neon-color: #ff00de; }
      }
      
      @keyframes neon-border-color-cycle {
        0% { --neon-color: #00ffff; }
        20% { --neon-color: #ff00de; }
        40% { --neon-color: #00ff00; }
        60% { --neon-color: #ff9500; }
        80% { --neon-color: #0000ff; }
        100% { --neon-color: #00ffff; }
      }
      
      @keyframes neon-hover-color-cycle {
        0% { --neon-color-hover: #ff9500; }
        33.3% { --neon-color-hover: #00ffff; }
        66.6% { --neon-color-hover: #ff00de; }
        100% { --neon-color-hover: #ff9500; }
      }
      
      /* Neon pulse animation */
      @keyframes neon-pulse {
        from { filter: brightness(0.9); }
        to { filter: brightness(1.2); }
      }
      
      /* Neon line fade animation */
      @keyframes neon-line-fade {
        0% { 
          opacity: 0; 
          --line-color: #ff00ff;
        }
        50% { 
          opacity: 0.7; 
          --line-color: #00ffff;
        }
        100% { 
          opacity: 0; 
          --line-color: #ff00de;
        }
      }
      
      /* Neon glow for icons and images */
      svg, img, i {
        filter: drop-shadow(0 0 5px var(--icon-color, #00ffff)) !important;
        animation: neon-icon-color-cycle 6s linear infinite !important;
      }
      
      @keyframes neon-icon-color-cycle {
        0% { --icon-color: #00ffff; }
        25% { --icon-color: #ff00de; }
        50% { --icon-color: #00ff00; }
        75% { --icon-color: #ff9500; }
        100% { --icon-color: #00ffff; }
      }
      
      /* Add colorful background glow */
      body::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at 50% 50%, 
                    rgba(0, 0, 0, 0), 
                    rgba(255, 0, 255, 0.05),
                    rgba(0, 255, 255, 0.05));
        pointer-events: none;
        z-index: 9996;
        animation: neon-background-shift 10s ease infinite;
      }
      
      @keyframes neon-background-shift {
        0% {
          background: radial-gradient(circle at 30% 30%, 
                      rgba(0, 0, 0, 0), 
                      rgba(255, 0, 255, 0.05),
                      rgba(0, 255, 255, 0.05));
        }
        33% {
          background: radial-gradient(circle at 70% 50%, 
                      rgba(0, 0, 0, 0), 
                      rgba(0, 255, 0, 0.05),
                      rgba(255, 0, 0, 0.05));
        }
        66% {
          background: radial-gradient(circle at 40% 70%, 
                      rgba(0, 0, 0, 0), 
                      rgba(0, 0, 255, 0.05),
                      rgba(255, 255, 0, 0.05));
        }
        100% {
          background: radial-gradient(circle at 30% 30%, 
                      rgba(0, 0, 0, 0), 
                      rgba(255, 0, 255, 0.05),
                      rgba(0, 255, 255, 0.05));
        }
      }
      
      /* Add neon flicker effect to some elements */
      h1, [class*="Title"], [class*="Heading"] {
        animation: neon-text-color-cycle 8s linear infinite, neon-flicker 2s linear infinite !important;
      }
      
      @keyframes neon-flicker {
        0% { opacity: 1; }
        80% { opacity: 1; }
        84% { opacity: 0.7; }
        85% { opacity: 1; }
        87% { opacity: 0.8; }
        88% { opacity: 1; }
        90% { opacity: 0.9; }
        95% { opacity: 1; }
        98% { opacity: 0.8; }
        100% { opacity: 1; }
      }
      
      /* Add neon dots in corners */
      .neon-line::before, .neon-line::after {
        content: '';
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--line-color, #ff00ff);
        box-shadow: 0 0 8px 2px var(--line-color, #ff00ff);
      }
      
      .neon-line::before {
        left: -2px;
        top: -2px;
      }
      
      .neon-line::after {
        right: -2px;
        top: -2px;
      }
    `;
    document.head.appendChild(styleElement);

    // Set a timeout to deactivate after 1 minute
    const timeout = setTimeout(() => {
      setIsActive(false);
      toast.success({ message: "Neon mode deactivated." });
    }, 60 * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isActive]);

  return null;
}
