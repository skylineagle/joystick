import { useCallback, useEffect, useState } from "react";
import { toast } from "@/utils/toast";

// Konami Code sequence
const konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

// Simplified Barrel Roll sequence (easier to type)
const barrelRollSequence = ["f", "l", "i", "p"];

// Disco mode sequence
const discoSequence = ["d", "i", "s", "c", "o"];

export const Konami = () => {
  const [konamiCodePosition, setKonamiCodePosition] = useState(0);
  const [barrelRollPosition, setBarrelRollPosition] = useState(0);
  const [discoPosition, setDiscoPosition] = useState(0);
  const [discoMode, setDiscoMode] = useState(false);
  const [discoInterval, setDiscoInterval] = useState<number | null>(null);

  const triggerDiscoMode = useCallback(() => {
    // Show a toast message
    toast.success({
      message: discoMode
        ? "🪩 Disco mode activated! 🕺"
        : "Disco mode deactivated",
    });

    if (!discoMode) return;

    // Generate random HSL color
    const randomHSLColor = () => {
      const h = Math.floor(Math.random() * 360);
      const s = Math.floor(Math.random() * 30) + 70; // 70-100%
      const l = Math.floor(Math.random() * 30) + 50; // 50-80%
      return `${h} ${s}% ${l}%`;
    };

    // Start changing colors
    const interval = window.setInterval(() => {
      document.documentElement.style.setProperty(
        "--background",
        randomHSLColor()
      );
      document.documentElement.style.setProperty(
        "--foreground",
        randomHSLColor()
      );
      document.documentElement.style.setProperty("--primary", randomHSLColor());
      document.documentElement.style.setProperty(
        "--secondary",
        randomHSLColor()
      );
      document.documentElement.style.setProperty("--accent", randomHSLColor());
    }, 1000);

    setDiscoInterval(interval);
  }, [discoMode]);

  // Konami Code easter egg
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the key matches the next key in the Konami sequence
      const expectedKonamiKey = konamiCode[konamiCodePosition];
      const expectedBarrelKey = barrelRollSequence[barrelRollPosition];
      const expectedDiscoKey = discoSequence[discoPosition];
      const keyPressed = e.key.toLowerCase();

      // Check for Konami code
      if (keyPressed === expectedKonamiKey.toLowerCase()) {
        const nextPosition = konamiCodePosition + 1;
        setKonamiCodePosition(nextPosition);

        // If the sequence is complete
        if (nextPosition === konamiCode.length) {
          // Reset the sequence
          setKonamiCodePosition(0);

          // Trigger the easter egg
          triggerKonamiCodeEasterEgg();
        }
      } else {
        // Reset if the sequence is broken
        setKonamiCodePosition(0);
      }

      // Check for Barrel Roll sequence
      if (keyPressed === expectedBarrelKey.toLowerCase()) {
        const nextPosition = barrelRollPosition + 1;
        setBarrelRollPosition(nextPosition);

        // If the sequence is complete
        if (nextPosition === barrelRollSequence.length) {
          // Reset the sequence
          setBarrelRollPosition(0);

          // Trigger the easter egg
          triggerBarrelRollEasterEgg();
        }
      } else {
        // Reset if the sequence is broken
        setBarrelRollPosition(0);
      }

      // Check for Disco sequence
      if (keyPressed === expectedDiscoKey.toLowerCase()) {
        const nextPosition = discoPosition + 1;
        setDiscoPosition(nextPosition);

        // If the sequence is complete
        if (nextPosition === discoSequence.length) {
          // Reset the sequence
          setDiscoPosition(0);

          // Toggle disco mode
          setDiscoMode((prev) => !prev);
        }
      } else {
        // Reset if the sequence is broken
        setDiscoPosition(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [konamiCodePosition, barrelRollPosition, discoPosition]);

  // Disco mode effect
  useEffect(() => {
    if (discoMode) {
      // Start disco mode
      triggerDiscoMode();
    } else {
      // Stop disco mode
      if (discoInterval) {
        window.clearInterval(discoInterval);
        setDiscoInterval(null);

        // Reset any color changes
        document.documentElement.style.removeProperty("--background");
        document.documentElement.style.removeProperty("--foreground");
        document.documentElement.style.removeProperty("--primary");
        document.documentElement.style.removeProperty("--secondary");
        document.documentElement.style.removeProperty("--accent");
      }
    }

    return () => {
      if (discoInterval) {
        window.clearInterval(discoInterval);
      }
    };
  }, [discoInterval, discoMode, triggerDiscoMode]);

  const triggerKonamiCodeEasterEgg = () => {
    // Create a div for the animation
    const eggDiv = document.createElement("div");
    eggDiv.innerHTML = "🎮";
    eggDiv.style.position = "fixed";
    eggDiv.style.fontSize = "100px";
    eggDiv.style.zIndex = "9999";
    eggDiv.style.pointerEvents = "none";
    document.body.appendChild(eggDiv);

    // Show a toast message
    toast.success({
      message: "Konami Code Activated!",
    });

    // Animate the joystick emoji flying across the screen
    let position = -100;
    const interval = setInterval(() => {
      position += 5;
      eggDiv.style.top = `${Math.sin(position / 30) * 100 + 200}px`;
      eggDiv.style.left = `${position}px`;
      eggDiv.style.transform = `rotate(${position}deg)`;

      if (position > window.innerWidth + 100) {
        clearInterval(interval);
        document.body.removeChild(eggDiv);
      }
    }, 16);
  };

  const triggerBarrelRollEasterEgg = () => {
    // Show a toast message
    toast.success({
      message: "Do a flip!",
    });

    // Create and inject the animation style if it doesn't exist
    if (!document.getElementById("flip-style")) {
      const styleElement = document.createElement("style");
      styleElement.id = "flip-style";
      styleElement.textContent = `
        @keyframes flip {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .flip {
          animation: flip 4s cubic-bezier(0.215, 0.610, 0.355, 1.000) 1;
        }
      `;
      document.head.appendChild(styleElement);
    }

    // Get the root element
    const rootElement = document.documentElement;

    // Remove the class if it's already there (in case of multiple triggers)
    rootElement.classList.remove("flip");

    // Force a reflow to ensure the animation restarts
    void rootElement.offsetWidth;

    // Add the class to trigger the animation
    rootElement.classList.add("flip");

    // Remove the class after the animation completes
    setTimeout(() => {
      rootElement.classList.remove("flip");
    }, 4000);

    // Also add a keyboard shortcut for easier testing
    console.log(
      "Barrel roll activated! You can also press F8 to trigger this effect."
    );
  };

  // Add a keyboard shortcut for easier testing
  useEffect(() => {
    const handleKeyboardShortcut = (e: KeyboardEvent) => {
      if (e.key === "F8") {
        triggerBarrelRollEasterEgg();
      } else if (e.key === "F9") {
        setDiscoMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcut);

    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcut);
    };
  }, []);

  return null;
};
