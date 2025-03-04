import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";

export function TypewriterEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the secret key combination (Command+Shift+T for Mac compatibility)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key === "o") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply typewriter effect when activated
  useEffect(() => {
    if (!isActive) {
      // Remove any existing typewriter effects
      const styleElement = document.getElementById("typewriter-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }

      // Restore any hidden text
      const hiddenElements = document.querySelectorAll(
        "[data-typewriter-original]"
      );
      hiddenElements.forEach((element) => {
        const originalText = element.getAttribute("data-typewriter-original");
        if (originalText) {
          element.textContent = originalText;
          element.removeAttribute("data-typewriter-original");
        }
      });

      return;
    }

    // Show toast notification
    toast.success({
      message:
        "Typewriter mode activated! Watch text appear character by character...",
    });

    // Add CSS for typewriter effect
    const styleElement = document.createElement("style");
    styleElement.id = "typewriter-style";
    styleElement.textContent = `
      @keyframes typewriter {
        from { width: 0; }
        to { width: 100%; }
      }
      
      .typewriter-text {
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
        border-right: 2px solid currentColor;
        animation: typewriter var(--typing-duration, 3s) steps(var(--character-count, 30)) 1 forwards,
                  blink-caret 0.75s step-end infinite;
      }
      
      @keyframes blink-caret {
        from, to { border-color: transparent; }
        50% { border-color: currentColor; }
      }
    `;
    document.head.appendChild(styleElement);

    // Apply typewriter effect to visible text elements
    const applyTypewriterEffect = () => {
      // Get all visible text elements
      const textElements = Array.from(
        document.querySelectorAll(
          "p, h1, h2, h3, h4, h5, h6, span, button, a, label"
        )
      ).filter((el) => {
        // Only apply to elements that are visible and have text
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        return (
          isVisible &&
          el.textContent?.trim() &&
          !el.querySelector(".typewriter-text")
        );
      });

      // Apply effect to a random element
      if (textElements.length > 0) {
        const randomElement =
          textElements[Math.floor(Math.random() * textElements.length)];

        // Skip if already processed
        if (randomElement.hasAttribute("data-typewriter-original")) return;

        // Store original text
        const originalText = randomElement.textContent || "";
        randomElement.setAttribute("data-typewriter-original", originalText);

        // Clear the element
        randomElement.textContent = "";

        // Create typewriter span
        const typewriterSpan = document.createElement("span");
        typewriterSpan.className = "typewriter-text";
        typewriterSpan.textContent = originalText;

        // Set custom properties for animation
        typewriterSpan.style.setProperty(
          "--character-count",
          originalText.length.toString()
        );
        typewriterSpan.style.setProperty(
          "--typing-duration",
          `${Math.max(1, originalText.length / 10)}s`
        );

        // Add to DOM
        randomElement.appendChild(typewriterSpan);
      }
    };

    // Apply effect to a new element every 3 seconds
    const interval = setInterval(applyTypewriterEffect, 500);

    // Apply to first element immediately
    applyTypewriterEffect();

    // Set a timeout to deactivate after 1 minute
    const timeout = setTimeout(() => {
      setIsActive(false);
      toast.success({ message: "Typewriter mode deactivated." });
    }, 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isActive]);

  return null;
}
