import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";

export function BubbleEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the secret key combination (Alt+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F3") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply bubble effect when activated
  useEffect(() => {
    if (!isActive) {
      // Remove any existing bubbles
      const bubbleContainer = document.getElementById("bubble-container");
      if (bubbleContainer) {
        document.body.removeChild(bubbleContainer);
      }

      // Remove styles
      const styleElement = document.getElementById("bubble-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }

      return;
    }

    // Show toast notification
    toast.success({ message: "Bubble mode activated! 🫧" });

    // Add CSS for bubbles
    const styleElement = document.createElement("style");
    styleElement.id = "bubble-style";
    styleElement.textContent = `
      .bubble {
        position: absolute;
        bottom: -50px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(173, 216, 230, 0.7) 40%, rgba(135, 206, 250, 0.4) 80%);
        box-shadow: 0 0 15px rgba(173, 216, 230, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.8);
        animation: float var(--float-duration, 8s) ease-in-out infinite;
        z-index: 9999;
        pointer-events: none;
        backdrop-filter: blur(1px);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
      
      @keyframes float {
        0% {
          transform: translateY(0) translateX(0) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 0.95;
        }
        90% {
          opacity: 0.85;
        }
        100% {
          transform: translateY(calc(-100vh - 100px)) translateX(var(--float-distance, 100px)) rotate(var(--rotation, 360deg));
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleElement);

    // Create container for bubbles
    const bubbleContainer = document.createElement("div");
    bubbleContainer.id = "bubble-container";
    bubbleContainer.style.position = "fixed";
    bubbleContainer.style.top = "0";
    bubbleContainer.style.left = "0";
    bubbleContainer.style.width = "100%";
    bubbleContainer.style.height = "100%";
    bubbleContainer.style.overflow = "hidden";
    bubbleContainer.style.pointerEvents = "none";
    bubbleContainer.style.zIndex = "9999";
    document.body.appendChild(bubbleContainer);

    // Function to create a bubble
    const createBubble = () => {
      if (!isActive) return;

      const bubble = document.createElement("div");
      bubble.className = "bubble";

      // Random size between 20px and 80px
      const size = Math.floor(Math.random() * 60) + 20;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;

      // Random horizontal position
      const left = Math.floor(Math.random() * window.innerWidth);
      bubble.style.left = `${left}px`;

      // Random float duration between 4s and 12s
      const floatDuration = Math.floor(Math.random() * 8) + 4;
      bubble.style.setProperty("--float-duration", `${floatDuration}s`);

      // Random horizontal float distance between -200px and 200px
      const floatDistance = Math.floor(Math.random() * 400) - 200;
      bubble.style.setProperty("--float-distance", `${floatDistance}px`);

      // Random rotation between -360deg and 360deg
      const rotation = Math.floor(Math.random() * 720) - 360;
      bubble.style.setProperty("--rotation", `${rotation}deg`);

      // Add to container
      bubbleContainer.appendChild(bubble);

      // Remove bubble after animation completes
      setTimeout(() => {
        if (bubble.parentNode === bubbleContainer) {
          bubbleContainer.removeChild(bubble);
        }
      }, floatDuration * 1000);
    };

    // Create bubbles at random intervals
    const createBubbles = () => {
      if (!isActive) return;

      // Create 1-3 bubbles
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        createBubble();
      }

      // Schedule next batch
      const nextInterval = Math.floor(Math.random() * 1000) + 500;
      setTimeout(createBubbles, nextInterval);
    };

    // Start creating bubbles
    createBubbles();

    // Set a timeout to deactivate after 1 minute
    const timeout = setTimeout(() => {
      setIsActive(false);
      toast.success({ message: "Bubble mode deactivated." });
    }, 60 * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isActive]);

  return null;
}
