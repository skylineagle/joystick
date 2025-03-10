import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";

export function RainEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the secret key combination (F11)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply rain effect when activated
  useEffect(() => {
    if (!isActive) {
      // Remove any existing raindrops
      const rainContainer = document.getElementById("rain-container");
      if (rainContainer) {
        document.body.removeChild(rainContainer);
      }

      // Remove styles
      const styleElement = document.getElementById("rain-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }

      return;
    }

    // Show toast notification
    toast.success({ message: "Rain mode activated! 🌧️" });

    // Add CSS for raindrops
    const styleElement = document.createElement("style");
    styleElement.id = "rain-style";
    styleElement.textContent = `
      .raindrop {
        position: absolute;
        top: -20px;
        width: 2px;
        height: var(--height, 20px);
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(105, 155, 255, 0.8));
        border-radius: 0 0 5px 5px;
        animation: fall var(--fall-duration, 1s) linear forwards;
        z-index: 9999;
        pointer-events: none;
        opacity: 0.7;
      }
      
      @keyframes fall {
        0% {
          transform: translateY(0) translateX(0);
          opacity: 0;
        }
        10% {
          opacity: 0.7;
        }
        90% {
          opacity: 0.7;
        }
        100% {
          transform: translateY(calc(100vh + 50px)) translateX(var(--drift, 10px));
          opacity: 0;
        }
      }
      
      .splash {
        position: absolute;
        width: 10px;
        height: 2px;
        background-color: rgba(105, 155, 255, 0.5);
        border-radius: 50%;
        animation: splash 0.5s linear forwards;
        z-index: 9998;
        pointer-events: none;
      }
      
      @keyframes splash {
        0% {
          transform: scale(0);
          opacity: 0.7;
        }
        100% {
          transform: scale(3);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleElement);

    // Create container for raindrops
    const rainContainer = document.createElement("div");
    rainContainer.id = "rain-container";
    rainContainer.style.position = "fixed";
    rainContainer.style.top = "0";
    rainContainer.style.left = "0";
    rainContainer.style.width = "100%";
    rainContainer.style.height = "100%";
    rainContainer.style.overflow = "hidden";
    rainContainer.style.pointerEvents = "none";
    rainContainer.style.zIndex = "9999";
    document.body.appendChild(rainContainer);

    // Function to create a raindrop
    const createRaindrop = () => {
      if (!isActive) return;

      const raindrop = document.createElement("div");
      raindrop.className = "raindrop";

      // Random height between 15px and 30px
      const height = Math.floor(Math.random() * 15) + 15;
      raindrop.style.setProperty("--height", `${height}px`);

      // Random horizontal position
      const left = Math.floor(Math.random() * window.innerWidth);
      raindrop.style.left = `${left}px`;

      // Random fall duration between 0.5s and 1.5s
      const fallDuration = Math.random() * 1 + 0.5;
      raindrop.style.setProperty("--fall-duration", `${fallDuration}s`);

      // Random horizontal drift between -10px and 10px
      const drift = Math.floor(Math.random() * 20) - 10;
      raindrop.style.setProperty("--drift", `${drift}px`);

      // Add to container
      rainContainer.appendChild(raindrop);

      // Create splash effect when raindrop hits bottom
      setTimeout(() => {
        if (!isActive) return;

        const splash = document.createElement("div");
        splash.className = "splash";
        splash.style.left = `${parseInt(raindrop.style.left) - 4 + drift}px`;
        splash.style.top = `${window.innerHeight - 2}px`;
        rainContainer.appendChild(splash);

        // Remove splash after animation completes
        setTimeout(() => {
          if (splash.parentNode === rainContainer) {
            rainContainer.removeChild(splash);
          }
        }, 500);

        // Remove raindrop
        if (raindrop.parentNode === rainContainer) {
          rainContainer.removeChild(raindrop);
        }
      }, fallDuration * 1000);
    };

    // Create raindrops at regular intervals
    const createRaindrops = () => {
      if (!isActive) return;

      // Create 5-15 raindrops
      const count = Math.floor(Math.random() * 10) + 5;
      for (let i = 0; i < count; i++) {
        createRaindrop();
      }

      // Schedule next batch
      const nextInterval = Math.floor(Math.random() * 100) + 50;
      setTimeout(createRaindrops, nextInterval);
    };

    // Start creating raindrops
    createRaindrops();

    // Set a timeout to deactivate after 1 minute
    const timeout = setTimeout(() => {
      setIsActive(false);
      toast.success({ message: "Rain mode deactivated." });
    }, 60 * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isActive]);

  return null;
}
