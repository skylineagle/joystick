import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";

export function PixelArtEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the secret key combination (Alt+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply pixel art effect when activated
  useEffect(() => {
    if (!isActive) {
      // Remove styles
      const styleElement = document.getElementById("pixel-art-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }

      // Remove canvas
      const pixelCanvas = document.getElementById("pixel-art-canvas");
      if (pixelCanvas) {
        document.body.removeChild(pixelCanvas);
      }

      return;
    }

    // Show toast notification
    toast.success({ message: "Pixel art mode activated! 🎮" });

    // Add CSS for pixel art effects
    const styleElement = document.createElement("style");
    styleElement.id = "pixel-art-style";
    styleElement.textContent = `
      /* Pixelated font */
      @font-face {
        font-family: 'Pixel';
        src: url('data:application/font-woff;charset=utf-8;base64,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') format('woff');
        font-style: normal;
        font-weight: normal;
      }
      
      /* Pixelated text */
      body, button, input, select, textarea {
        font-family: 'Pixel', monospace !important;
        image-rendering: pixelated !important;
      }
      
      /* Pixelated images */
      img, svg, video, canvas {
        image-rendering: pixelated !important;
      }
      
      /* Pixelated borders */
      * {
        border-radius: 0 !important;
      }
      
      /* 8-bit color palette */
      :root {
        --pixel-black: #000000;
        --pixel-blue: #0000AA;
        --pixel-green: #00AA00;
        --pixel-cyan: #00AAAA;
        --pixel-red: #AA0000;
        --pixel-magenta: #AA00AA;
        --pixel-yellow: #FFAA00;
        --pixel-white: #AAAAAA;
        --pixel-bright-black: #555555;
        --pixel-bright-blue: #5555FF;
        --pixel-bright-green: #55FF55;
        --pixel-bright-cyan: #55FFFF;
        --pixel-bright-red: #FF5555;
        --pixel-bright-magenta: #FF55FF;
        --pixel-bright-yellow: #FFFF55;
        --pixel-bright-white: #FFFFFF;
      }
      
      /* Pixelated cursor */
      * {
        cursor: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjAtMDEtMDdUMTc6MDI6MTQtMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTAxLTA3VDE3OjAzOjE5LTA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTAxLTA3VDE3OjAzOjE5LTA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjRiZjA5ZjNlLWMzZjYtNDFhZC05OWIyLTI0YzJmMWRmNmU0ZSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0YmYwOWYzZS1jM2Y2LTQxYWQtOTliMi0yNGMyZjFkZjZlNGUiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0YmYwOWYzZS1jM2Y2LTQxYWQtOTliMi0yNGMyZjFkZjZlNGUiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjRiZjA5ZjNlLWMzZjYtNDFhZC05OWIyLTI0YzJmMWRmNmU0ZSIgc3RFdnQ6d2hlbj0iMjAyMC0wMS0wN1QxNzowMjoxNC0wODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKE1hY2ludG9zaCkiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Gy1prAAAAEFJREFUGJVjYMAEjxkYGP5jkXvEwMDwH5ccIxZJrOAhNnEmdMn/WBT9x6aOiQENYJP8j0UTdnEmdMn/WCT/Y5MDALJRFel3y9oKAAAAAElFTkSuQmCC') 0 0, auto !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Create a canvas for the pixelation effect
    const canvas = document.createElement("canvas");
    canvas.id = "pixel-art-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    canvas.style.opacity = "0.2";
    document.body.appendChild(canvas);

    // Set canvas size
    const pixelSize = 4; // Size of each "pixel"
    const updateCanvasSize = () => {
      canvas.width = Math.ceil(window.innerWidth / pixelSize);
      canvas.height = Math.ceil(window.innerHeight / pixelSize);
    };
    updateCanvasSize();

    // Draw random static on the canvas
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = [
      "#000000",
      "#0000AA",
      "#00AA00",
      "#00AAAA",
      "#AA0000",
      "#AA00AA",
      "#FFAA00",
      "#AAAAAA",
      "#555555",
      "#5555FF",
      "#55FF55",
      "#55FFFF",
      "#FF5555",
      "#FF55FF",
      "#FFFF55",
      "#FFFFFF",
    ];

    const drawStatic = () => {
      if (!isActive || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
          if (Math.random() < 0.05) {
            // Only draw some pixels for a subtle effect
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }

      requestAnimationFrame(drawStatic);
    };

    // Start the animation
    drawStatic();

    // Handle window resize
    window.addEventListener("resize", updateCanvasSize);

    // Set a timeout to deactivate after 45 seconds
    const timeout = setTimeout(() => {
      setIsActive(false);
      toast.success({ message: "Pixel art mode deactivated." });
    }, 45 * 1000);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [isActive]);

  return null;
}
