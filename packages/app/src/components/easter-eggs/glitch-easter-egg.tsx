import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";

export function GlitchEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the F2 key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply glitch effect when activated
  useEffect(() => {
    if (!isActive) {
      // Remove any existing glitch styles and elements
      const styleElement = document.getElementById("glitch-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }

      const glitchOverlay = document.getElementById("glitch-overlay");
      if (glitchOverlay) {
        document.body.removeChild(glitchOverlay);
      }

      return;
    }

    // Show toast notification
    toast.success({ message: "System Malfunction! Glitch Mode activated! 🐛" });

    // Create glitch overlay
    const glitchOverlay = document.createElement("div");
    glitchOverlay.id = "glitch-overlay";
    document.body.appendChild(glitchOverlay);

    // Add CSS for glitch effect
    const styleElement = document.createElement("style");
    styleElement.id = "glitch-style";
    styleElement.textContent = `
      @keyframes glitch-text {
        0% {
          transform: translate(0);
          text-shadow: 0 0 0 #0f0, 0 0 0 #f00;
        }
        2% {
          transform: translate(-2px, 1px);
          text-shadow: -2px 0 0 #0f0, 2px 0 0 #f00;
        }
        4% {
          transform: translate(-2px, -1px);
          text-shadow: 2px 0 0 #0f0, -2px 0 0 #f00;
        }
        6% {
          transform: translate(0);
          text-shadow: 0 0 0 #0f0, 0 0 0 #f00;
        }
        8% {
          transform: translate(2px, 1px);
          text-shadow: -2px 0 0 #0f0, 2px 0 0 #f00;
        }
        10% {
          transform: translate(0);
          text-shadow: 0 0 0 #0f0, 0 0 0 #f00;
        }
        20% {
          transform: translate(0);
          text-shadow: 0 0 0 #0f0, 0 0 0 #f00;
        }
        22% {
          transform: translate(1px, -1px);
          text-shadow: -1px 0 0 #0f0, 1px 0 0 #f00;
        }
        24% {
          transform: translate(0);
          text-shadow: 0 0 0 #0f0, 0 0 0 #f00;
        }
        100% {
          transform: translate(0);
          text-shadow: 0 0 0 #0f0, 0 0 0 #f00;
        }
      }
      
      @keyframes glitch-background {
        0% {
          background-position: 0 0;
          filter: hue-rotate(0deg);
        }
        10% {
          background-position: 5px 0;
        }
        20% {
          background-position: -5px 0;
        }
        30% {
          background-position: 15px 0;
        }
        40% {
          background-position: 5px 0;
        }
        50% {
          background-position: -25px 0;
        }
        60% {
          background-position: -50px 0;
          filter: hue-rotate(180deg);
        }
        70% {
          background-position: 0 -20px;
        }
        80% {
          background-position: -60px -20px;
        }
        81% {
          background-position: 0 0;
        }
        100% {
          background-position: 0 0;
          filter: hue-rotate(0deg);
        }
      }
      
      @keyframes glitch-skew {
        0% {
          transform: skew(0deg, 0deg);
        }
        48% {
          transform: skew(0deg, 0deg);
        }
        50% {
          transform: skew(-20deg, 0deg);
        }
        52% {
          transform: skew(20deg, 0deg);
        }
        54% {
          transform: skew(0deg, 0deg);
        }
        100% {
          transform: skew(0deg, 0deg);
        }
      }
      
      body {
        position: relative;
        animation: glitch-skew 4s infinite linear alternate-reverse;
      }
      
      #glitch-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        background: linear-gradient(rgba(255, 0, 0, 0.1), rgba(0, 255, 0, 0.1));
        mix-blend-mode: difference;
        animation: glitch-background 8s infinite;
      }
      
      h1, h2, h3, h4, h5, h6, p, span, a, button, input, label {
        animation: glitch-text 3s infinite;
      }
      
      img {
        position: relative;
      }
      
      img::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 0, 0, 0.2);
        mix-blend-mode: multiply;
        animation: glitch-background 5s infinite;
      }
      
      /* Random UI glitches */
      @keyframes random-glitch {
        0%, 100% { opacity: 1; transform: translateX(0); }
        10% { opacity: 0.8; transform: translateX(5px); }
        20% { opacity: 1; transform: translateX(0); }
        30% { opacity: 0.6; transform: translateX(-5px); }
        40% { opacity: 1; transform: translateX(0); }
        50% { opacity: 0.9; transform: translateX(3px); }
        60% { opacity: 1; transform: translateX(0); }
        70% { opacity: 0.7; transform: translateX(-3px); }
        80% { opacity: 1; transform: translateX(0); }
        90% { opacity: 0.8; transform: translateX(2px); }
      }
    `;
    document.head.appendChild(styleElement);

    // Create random UI glitches
    const applyRandomGlitches = () => {
      if (!isActive) return;

      const elements = document.querySelectorAll("div, button, input, a");
      const randomElement =
        elements[Math.floor(Math.random() * elements.length)];
      if (randomElement) {
        const htmlElement = randomElement as HTMLElement;
        htmlElement.style.animation = "random-glitch 0.5s";
        setTimeout(() => {
          if (randomElement) {
            const htmlElement = randomElement as HTMLElement;
            htmlElement.style.animation = "";
          }
        }, 500);
      }

      // Schedule next glitch
      setTimeout(applyRandomGlitches, Math.random() * 2000 + 500);
    };

    // Start random glitches
    applyRandomGlitches();

    // Set a timeout to deactivate after 30 seconds
    const timeout = setTimeout(() => {
      setIsActive(false);
      toast.success({ message: "System restored. Glitch Mode deactivated." });
    }, 30 * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isActive]);

  return null;
}
