import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";

export function SparkleEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the secret key combination (F6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.ctrlKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply sparkle effect when activated
  useEffect(() => {
    if (!isActive) {
      // Remove styles
      const styleElement = document.getElementById("sparkle-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }

      // Remove event listeners
      document.removeEventListener("click", handleClick);

      // Remove any existing sparkles
      const sparkles = document.querySelectorAll(".sparkle");
      sparkles.forEach((sparkle) => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
      });

      return;
    }

    // Show toast notification
    toast.success({ message: "Sparkle mode activated! ✨" });

    // Add CSS for sparkle effect
    const styleElement = document.createElement("style");
    styleElement.id = "sparkle-style";
    styleElement.textContent = `
      .sparkle {
        position: absolute;
        pointer-events: none;
        z-index: 10000;
        animation: sparkle-fade 1s ease-out forwards;
      }
      
      @keyframes sparkle-fade {
        0% {
          transform: scale(0) rotate(0deg);
          opacity: 0;
        }
        50% {
          transform: scale(1) rotate(180deg);
          opacity: 1;
        }
        100% {
          transform: scale(0) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleElement);

    // Function to create a sparkle
    const createSparkle = (x: number, y: number, color: string) => {
      const sparkle = document.createElement("div");
      sparkle.className = "sparkle";

      // Create SVG for the sparkle
      const size = Math.floor(Math.random() * 20) + 10; // 10-30px

      // Create a star shape
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", `${size}`);
      svg.setAttribute("height", `${size}`);
      svg.setAttribute("viewBox", "0 0 24 24");

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute(
        "d",
        "M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z"
      );
      path.setAttribute("fill", color);

      svg.appendChild(path);
      sparkle.appendChild(svg);

      // Position the sparkle
      sparkle.style.left = `${x - size / 2}px`;
      sparkle.style.top = `${y - size / 2}px`;

      // Add to document
      document.body.appendChild(sparkle);

      // Remove after animation completes
      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
      }, 1000);
    };

    // Function to handle click
    function handleClick(e: MouseEvent) {
      if (!isActive) return;

      // Create multiple sparkles at the click position
      const colors = [
        "#FFD700", // Gold
        "#FF1493", // Deep Pink
        "#00BFFF", // Deep Sky Blue
        "#7CFC00", // Lawn Green
        "#FF4500", // Orange Red
        "#9400D3", // Dark Violet
      ];

      // Create 10-15 sparkles
      const count = Math.floor(Math.random() * 6) + 10;

      for (let i = 0; i < count; i++) {
        // Random position around the click
        const offsetX = Math.random() * 40 - 20; // -20 to 20
        const offsetY = Math.random() * 40 - 20; // -20 to 20

        // Random color
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Create sparkle with slight delay for each
        setTimeout(() => {
          createSparkle(e.clientX + offsetX, e.clientY + offsetY, color);
        }, Math.random() * 200);
      }
    }

    // Add event listener
    document.addEventListener("click", handleClick);

    // Set a timeout to deactivate after 1 minute
    const timeout = setTimeout(() => {
      setIsActive(false);
      toast.success({ message: "Sparkle mode deactivated." });
    }, 60 * 1000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handleClick);
    };
  }, [isActive]);

  return null;
}
