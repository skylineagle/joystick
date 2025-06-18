import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";

export function MatrixEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the secret key combination (F4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.ctrlKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply Matrix effect when activated
  useEffect(() => {
    if (!isActive) {
      // Remove any existing matrix elements
      const matrixContainer = document.getElementById("matrix-container");
      if (matrixContainer) {
        document.body.removeChild(matrixContainer);
      }

      // Remove styles
      const styleElement = document.getElementById("matrix-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }

      return;
    }

    // Show toast notification
    toast.success({ message: "Matrix mode activated! 💻" });

    // Add CSS for matrix effect
    const styleElement = document.createElement("style");
    styleElement.id = "matrix-style";
    styleElement.textContent = `
      .matrix-column {
        position: absolute;
        top: -100px;
        font-family: monospace;
        font-size: 16px;
        color: #0f0;
        text-shadow: 0 0 5px #0f0;
        white-space: nowrap;
        opacity: 0.8;
        z-index: 9999;
        pointer-events: none;
      }
      
      @keyframes matrix-fall {
        0% {
          transform: translateY(-100%);
          opacity: 1;
        }
        100% {
          transform: translateY(calc(100vh + 100px));
          opacity: 0.5;
        }
      }
    `;
    document.head.appendChild(styleElement);

    // Create container for matrix
    const matrixContainer = document.createElement("div");
    matrixContainer.id = "matrix-container";
    matrixContainer.style.position = "fixed";
    matrixContainer.style.top = "0";
    matrixContainer.style.left = "0";
    matrixContainer.style.width = "100%";
    matrixContainer.style.height = "100%";
    matrixContainer.style.overflow = "hidden";
    matrixContainer.style.pointerEvents = "none";
    matrixContainer.style.zIndex = "9999";
    document.body.appendChild(matrixContainer);

    // Matrix characters
    const matrixChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";

    // Function to create a matrix column
    const createMatrixColumn = () => {
      if (!isActive) return;

      const column = document.createElement("div");
      column.className = "matrix-column";

      // Random horizontal position
      const left = Math.floor(Math.random() * window.innerWidth);
      column.style.left = `${left}px`;

      // Random fall duration between 5s and 15s
      const fallDuration = Math.floor(Math.random() * 10) + 5;
      column.style.animation = `matrix-fall ${fallDuration}s linear`;

      // Generate random characters
      const length = Math.floor(Math.random() * 20) + 10;
      let content = "";
      for (let i = 0; i < length; i++) {
        const charIndex = Math.floor(Math.random() * matrixChars.length);
        content += matrixChars[charIndex] + "<br>";
      }
      column.innerHTML = content;

      // Add to container
      matrixContainer.appendChild(column);

      // Remove column after animation completes
      setTimeout(() => {
        if (column.parentNode === matrixContainer) {
          matrixContainer.removeChild(column);
        }
      }, fallDuration * 1000);
    };

    // Create matrix columns at random intervals
    const createMatrixColumns = () => {
      if (!isActive) return;

      // Create 1-3 columns
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        createMatrixColumn();
      }

      // Schedule next batch
      const nextInterval = Math.floor(Math.random() * 300) + 100;
      setTimeout(createMatrixColumns, nextInterval);
    };

    // Start creating matrix columns
    createMatrixColumns();

    // Set a timeout to deactivate after 1 minute
    const timeout = setTimeout(() => {
      setIsActive(false);
      toast.success({ message: "Matrix mode deactivated." });
    }, 60 * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isActive]);

  return null;
}
