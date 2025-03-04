import { toast } from "@/utils/toast";
import { useEffect, useState } from "react";

export function GravityEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the secret key combination (Ctrl+G)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key === "g") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply gravity effect when activated
  useEffect(() => {
    if (!isActive) return;

    // Show toast notification
    toast.success({ message: "Gravity activated! Everything is falling!" });

    // Get all elements that can be affected
    const elements = document.querySelectorAll(
      "div, p, h1, h2, h3, button, img, span, a"
    );

    // Create a style element for the animations
    const styleElement = document.createElement("style");
    styleElement.id = "gravity-style";
    styleElement.textContent = `
      @keyframes fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(2000px) rotate(30deg); opacity: 0; }
      }
      
      .falling {
        animation: fall 3s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards !important;
        position: relative !important;
        z-index: 9999 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Apply falling animation to elements with random delays
    elements.forEach((element) => {
      // Skip certain elements to keep the UI somewhat functional
      if (
        element.closest("nav") ||
        element.closest("header") ||
        element.tagName === "BODY" ||
        element.tagName === "HTML"
      ) {
        return;
      }

      // Add falling class with random delay
      setTimeout(() => {
        element.classList.add("falling");
      }, Math.random() * 2000); // Random delay up to 2 seconds
    });

    // Reset after animation completes
    const resetTimeout = setTimeout(() => {
      setIsActive(false);

      // Remove falling classes
      elements.forEach((element) => {
        element.classList.remove("falling");
      });

      // Remove style element
      const styleEl = document.getElementById("gravity-style");
      if (styleEl) {
        document.head.removeChild(styleEl);
      }

      // Show reset notification
      toast.success({ message: "Gravity restored! Refreshing page..." });

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }, 5000);

    return () => {
      clearTimeout(resetTimeout);
    };
  }, [isActive]);

  return null;
}
