import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";

export function ZoomEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  // Listen for the secret key combination (F5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Apply zoom effect when activated
  useEffect(() => {
    if (!isActive) {
      // Remove styles
      const styleElement = document.getElementById("zoom-style");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }

      // Remove event listeners
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);

      return;
    }

    // Show toast notification
    toast.success({ message: "Zoom mode activated! 🔍" });

    // Function to handle mouse over
    function handleMouseOver(e: MouseEvent) {
      if (!isActive) return;

      const target = e.target as HTMLElement;
      if (target && !target.classList.contains("zoom-ignore")) {
        target.style.transition = "transform 0.3s ease";
        target.style.transform = "scale(1.2)";
        target.style.zIndex = "1000";
        target.dataset.zoomActive = "true";
      }
    }

    // Function to handle mouse out
    function handleMouseOut(e: MouseEvent) {
      if (!isActive) return;

      const target = e.target as HTMLElement;
      if (target && target.dataset.zoomActive === "true") {
        target.style.transform = "scale(1)";
        target.style.zIndex = "";
        delete target.dataset.zoomActive;
      }
    }

    // Add CSS for zoom effect
    const styleElement = document.createElement("style");
    styleElement.id = "zoom-style";
    styleElement.textContent = `
      * {
        transition: transform 0.3s ease !important;
      }
      
      .zoom-ignore {
        transition: none !important;
      }
      
      body {
        overflow-x: hidden;
      }
    `;
    document.head.appendChild(styleElement);

    // Add event listeners
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    // Create a floating magnifying glass cursor
    const cursor = document.createElement("div");
    cursor.id = "zoom-cursor";
    cursor.style.position = "fixed";
    cursor.style.width = "30px";
    cursor.style.height = "30px";
    cursor.style.borderRadius = "50%";
    cursor.style.border = "2px solid #666";
    cursor.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    cursor.style.pointerEvents = "none";
    cursor.style.zIndex = "10000";
    cursor.style.transform = "translate(-50%, -50%)";
    cursor.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
    cursor.style.backdropFilter = "blur(1px)";
    cursor.style.display = "none";
    cursor.classList.add("zoom-ignore");
    document.body.appendChild(cursor);

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive) return;

      cursor.style.display = "block";
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    document.addEventListener("mousemove", handleMouseMove);

    // Set a timeout to deactivate after 1 minute
    const timeout = setTimeout(() => {
      setIsActive(false);
      toast.success({ message: "Zoom mode deactivated." });

      // Remove cursor
      const zoomCursor = document.getElementById("zoom-cursor");
      if (zoomCursor) {
        document.body.removeChild(zoomCursor);
      }
    }, 60 * 1000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mousemove", handleMouseMove);

      // Remove cursor
      const zoomCursor = document.getElementById("zoom-cursor");
      if (zoomCursor) {
        document.body.removeChild(zoomCursor);
      }
    };
  }, [isActive]);

  return null;
}
