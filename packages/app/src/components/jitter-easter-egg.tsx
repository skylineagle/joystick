import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";

export function JitterEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the secret key combination (F7)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply jitter effect when activated
  useEffect(() => {
    if (!isActive) {
      // Remove styles
      const styleElement = document.getElementById("jitter-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }

      // Remove classes from elements
      const jitterElements = document.querySelectorAll(".jitter-effect");
      jitterElements.forEach((element) => {
        element.classList.remove("jitter-effect");
      });

      return;
    }

    // Show toast notification
    toast.success({ message: "Jitter mode activated! 📳" });

    // Add CSS for jitter effect
    const styleElement = document.createElement("style");
    styleElement.id = "jitter-style";
    styleElement.textContent = `
      @keyframes jitter {
        0% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(1px, 1px) rotate(0.5deg); }
        50% { transform: translate(-1px, -1px) rotate(-0.5deg); }
        75% { transform: translate(1px, -1px) rotate(0.5deg); }
        100% { transform: translate(0, 0) rotate(0deg); }
      }
      
      .jitter-effect {
        animation: jitter 0.15s infinite linear;
        transform-origin: center;
      }
      
      .jitter-effect-slow {
        animation: jitter 0.3s infinite linear;
      }
      
      .jitter-effect-fast {
        animation: jitter 0.08s infinite linear;
      }
    `;
    document.head.appendChild(styleElement);

    // Apply jitter to interactive elements
    const applyJitterToElements = () => {
      // Target buttons, inputs, links, and other interactive elements
      const selectors = [
        "button",
        "a",
        "input",
        "select",
        "textarea",
        ".card",
        ".button",
        "h1",
        "h2",
        "h3",
        "img",
        "svg",
        ".icon",
      ];

      selectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          // Add jitter class
          element.classList.add("jitter-effect");

          // Randomly assign different jitter speeds to some elements
          if (Math.random() > 0.7) {
            element.classList.add("jitter-effect-slow");
            // eslint-disable-next-line no-dupe-else-if
          } else if (Math.random() > 0.7) {
            element.classList.add("jitter-effect-fast");
          }
        });
      });
    };

    // Apply jitter effect
    applyJitterToElements();

    // Reapply jitter effect when DOM changes (for dynamically added elements)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          applyJitterToElements();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Set a timeout to deactivate after 30 seconds (this effect can be annoying)
    const timeout = setTimeout(() => {
      setIsActive(false);
      toast.success({ message: "Jitter mode deactivated." });
    }, 30 * 1000);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [isActive]);

  return null;
}
